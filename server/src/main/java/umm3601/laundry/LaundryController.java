package umm3601.laundry;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.Iterator;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.mongodb.client.model.Filters.eq;

public class LaundryController {
  private final MongoCollection<Document> roomCollection;
  private final MongoCollection<Document> machineCollection;
  private long previousTime = System.currentTimeMillis();

  public LaundryController(MongoDatabase machineDatabase, MongoDatabase roomDatabase)  {
    machineCollection = machineDatabase.getCollection("machines");
    roomCollection = roomDatabase.getCollection("rooms");
  }

  public String getRooms() { return serializeIterable(roomCollection.find()); }

  public String getMachines() {
    this.updateTime();
    return serializeIterable(machineCollection.find());
  }

  public String getMachinesAtRoom(String room) {
    this.updateTime();
    Document filterDoc = new Document();
    filterDoc = filterDoc.append("room_id", room);      // TODO use hex string representation of id: new Object("id")
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

  public void updateTime() {
    long currentTime = System.currentTimeMillis();
    int timeDifferenceMins = (int)((currentTime - previousTime)/ 1000
//      / 60
      );

    this.previousTime = currentTime;

    FindIterable<Document> jsonMachines = machineCollection.find();
    Iterator<Document> iterator = jsonMachines.iterator();

    while (iterator.hasNext()) {
      Document document = iterator.next();
      Document origin = new Document(document);
      if (document.getBoolean("running")) {
        if (document.get("previousRunningState") == null || !document.getBoolean("previousRunningState")) {
          document.put("remainingTime", 60);
          document.put("vacantTime", -1);
          document.put("previousRunningState", true);
        } else {
          if (document.getInteger("remainingTime") > 0) {
            document.put("remainingTime", document.getInteger("remainingTime") - timeDifferenceMins);
          }
          document.put("vacantTime", -1);
        }
      } else {
        if (document.get("previousRunningState") == null || document.getBoolean("previousRunningState")) {
          document.put("vacantTime", 0);
          document.put("remainingTime", -1);
          document.put("previousRunningState", false);
        } else {
          document.put("vacantTime", document.getInteger("vacantTime") + timeDifferenceMins);
          document.put("remainingTime", -1);
        }
      }
      machineCollection.replaceOne(origin, document);
    }
  }
}
