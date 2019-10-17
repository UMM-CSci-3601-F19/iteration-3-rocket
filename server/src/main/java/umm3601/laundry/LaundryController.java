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

  private  MongoCollection<Document> machinePollingCollection;
  private MongoDatabase pullingDatabase;

  public LaundryController(MongoDatabase machineDatabase, MongoDatabase roomDatabase,
                           MongoDatabase machinePollingDatabase)  {
    this.pullingDatabase = machinePollingDatabase;
    machineCollection = machineDatabase.getCollection("machines");
    roomCollection = roomDatabase.getCollection("rooms");
    machinePollingCollection = machinePollingDatabase.getCollection("machineDataFromPollingAPI");
    this.updateMachines();
  }

  public String getRooms() { return serializeIterable(roomCollection.find()); }

  public String getMachines() {
    this.updateMachines();
    return serializeIterable(machineCollection.find());
  }

  public String getMachinesAtRoom(String room) {
    this.updateMachines();
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
    this.updateMachines();
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

  private void updateMachines() {
    machinePollingCollection = pullingDatabase.getCollection("machineDataFromPollingAPI");
    long currentTime = System.currentTimeMillis();

    FindIterable<Document> jsonMachines = machinePollingCollection.find();

    for (Document document : jsonMachines) {
      Document oldDocument = document;
      FindIterable<Document> documentsOld = machineCollection.find();
      for (Document d : documentsOld) {
        if (d.get("id").equals(document.get("id"))) {
          oldDocument = d;
          break;
        }
      }

      Document origin = new Document(document);
      if (document.getBoolean("running")) {
        if (oldDocument.get("running") == null || !oldDocument.getBoolean("running")
          || document.get("remainingTime") == null || document.get("runBegin") == null) {
          document.put("runBegin", currentTime);
          document.put("remainingTime", 60);
          document.put("runEnd", -1);
          document.put("vacantTime", -1);
        } else {
          document.put("remainingTime", Math.max(0, 60 - (int) ((currentTime - document.getLong("runBegin")) / 60000)));
          document.put("runEnd", -1);
          document.put("vacantTime", -1);
        }
      } else {
        if (oldDocument.get("running") == null || oldDocument.getBoolean("running") || document.get("runEnd") == null) {
          document.put("runEnd", currentTime);
          document.put("vacantTime", 0);
          document.put("runBegin", -1);
          document.put("remainingTime", -1);
        } else {
          document.put("vacantTime", (int) ((currentTime - document.getLong("runEnd")) / 60000));
          document.put("runBegin", -1);
          document.put("remainingTime", -1);
        }
      }
      machinePollingCollection.replaceOne(origin, document);
    }
    machineCollection = machinePollingCollection;
  }
}
