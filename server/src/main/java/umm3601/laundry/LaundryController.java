package umm3601.laundry;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import java.util.Iterator;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.mongodb.client.model.Filters.eq;

public class LaundryController {
  private final MongoCollection<Document> roomCollection;
  private MongoCollection<Document> machineCollection;

  private MongoCollection<Document> machinePollingCollection;
  private MongoCollection<Document> roomPollingCollection;
  private MongoDatabase machinePullingDatabase;
  private MongoDatabase roomPullingDatabase;

  /*
   * This is a switch for the E2E test
   * before running the tests
   * set seedLocalSource to be true,
   * after testing, set the boolean
   * back to true in order to make
   * the functionality works.
   */
  private boolean seedLocalSource = true;

  public LaundryController(MongoDatabase machineDatabase, MongoDatabase roomDatabase, MongoDatabase machinePollingDatabase, MongoDatabase roomPollingDatabase) {
    this.machinePullingDatabase = machinePollingDatabase;
    this.roomPullingDatabase = roomPollingDatabase;
    machineCollection = machineDatabase.getCollection("machines");
    roomCollection = roomDatabase.getCollection("rooms");
    if (!seedLocalSource) {
      machinePollingCollection = machinePollingDatabase.getCollection("machineDataFromPollingAPI");
      roomPollingCollection = machinePollingDatabase.getCollection("roomDataFromPollingAPI");
    } else {
      machinePollingCollection = machineDatabase.getCollection("machines");
      roomPollingCollection = machineDatabase.getCollection("rooms");
    }
    this.updateRooms();
    this.updateMachines();
  }

  public String getRooms() {
    return serializeIterable(roomCollection.find());
  }

  public String getMachines() {
    return serializeIterable(machineCollection.find());
  }

  public String getMachinesAtRoom(String room) {
    Document filterDoc = new Document();
    filterDoc = filterDoc.append("room_id", room);
    return serializeIterable(machineCollection.find(filterDoc));
  }

  private String serializeIterable(Iterable<Document> documents) {
    return StreamSupport.stream(documents.spliterator(), false)
      .map(Document::toJson)
      .collect(Collectors.joining(", ", "[", "]"));
  }

  public String getMachine(String id) {
    FindIterable<Document> jsonMachines
      = machineCollection.find(eq("id", id));

    Iterator<Document> iterator = jsonMachines.iterator();
    if (iterator.hasNext()) {
      Document machine = iterator.next();
      return machine.toJson();
    } else {
      // We didn't find the desired machine
      return null;
    }
  }

  public void updateMachines() {

    if (!seedLocalSource) {
      machinePollingCollection = machinePullingDatabase.getCollection("machineDataFromPollingAPI");
    } else {
      machinePollingCollection = machinePullingDatabase.getCollection("machines");
    }

    long currentTime = System.currentTimeMillis();

    FindIterable<Document> newMachines = machinePollingCollection.find();

    for (Document newDocument : newMachines) {
      Document oldDocument = new Document(newDocument);
      FindIterable<Document> oldDocuments = machineCollection.find();
      for (Document d : oldDocuments) {
        if (d.get("id").equals(newDocument.get("id"))) {
          oldDocument = new Document(d);
          break;
        }
      }
      Document originalNewDocument = new Document(newDocument);

      if (newDocument.getBoolean("running")) {
        if (newDocument.get("type").equals("dryer")) {
          if (!oldDocument.getBoolean("running") || oldDocument.get("runBegin") == null) {
            newDocument.put("runBegin", currentTime);
            newDocument.put("remainingTime", 60);
            newDocument.put("runEnd", -1);
            newDocument.put("vacantTime", -1);
          } else {
            newDocument.put("runBegin", oldDocument.get("runBegin"));
            newDocument.put("remainingTime", Math.max(0, 60 - (int) ((currentTime - oldDocument.getLong("runBegin")) / 60000)));
            newDocument.put("runEnd", -1);
            newDocument.put("vacantTime", -1);
          }
        } else {
          if (!oldDocument.getBoolean("running") || oldDocument.get("runBegin") == null) {
            newDocument.put("runBegin", currentTime);
            newDocument.put("remainingTime", 35);
            newDocument.put("runEnd", -1);
            newDocument.put("vacantTime", -1);
          } else {
            newDocument.put("runBegin", oldDocument.get("runBegin"));
            newDocument.put("remainingTime", Math.max(0, 35 - (int) ((currentTime - oldDocument.getLong("runBegin")) / 60000)));
            newDocument.put("runEnd", -1);
            newDocument.put("vacantTime", -1);
          }
        }
      } else {
        if (oldDocument.getBoolean("running") || oldDocument.get("runEnd") == null) {
          newDocument.put("runEnd", currentTime);
          newDocument.put("vacantTime", 0);
          newDocument.put("runBegin", -1);
          newDocument.put("remainingTime", -1);
        } else {
          newDocument.put("runEnd", oldDocument.get("runEnd"));
          newDocument.put("vacantTime", (int) ((currentTime - oldDocument.getLong("runEnd")) / 60000));
          newDocument.put("runBegin", -1);
          newDocument.put("remainingTime", -1);
        }
      }
      machinePollingCollection.replaceOne(originalNewDocument, newDocument);
    }

    if (!seedLocalSource) {
      machineCollection.drop();
      int n = 0;
      for (Document d : newMachines) {
        machineCollection.insertOne(d);
        ++n;
      }
      System.out.println("[update] INFO laundry.LaundryController - Updated machines collection with " + n + " machines");
    } else {
      System.out.println("[update] INFO laundry.LaundryController - Updated machines collection with " + machineCollection.count() + " machines");
    }
 }

  public void updateRooms() {

    if (!seedLocalSource) {
      roomPollingCollection = roomPullingDatabase.getCollection("roomDataFromPollingAPI");

      FindIterable<Document> newRooms = roomPollingCollection.find();
      roomCollection.drop();
      int n = 0;
      for (Document d : newRooms) {
        roomCollection.insertOne(d);
        ++n;
      }
      System.out.println("[update] INFO laundry.LaundryController - Updated rooms collection with " + n + " rooms");
    } else {
      System.out.println("[update] INFO laundry.LaundryController - Skipped updating rooms collection");
    }
  }
}
