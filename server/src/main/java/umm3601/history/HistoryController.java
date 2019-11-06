package umm3601.history;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import org.bson.conversions.Bson;

import java.util.Calendar;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.mongodb.client.model.Filters.and;

public class HistoryController {
  private final MongoCollection<Document> roomCollection;
  private MongoCollection<Document> roomHistoryCollection;
  private MongoCollection<Document> machineCollection;

  public HistoryController(MongoDatabase machineDatabase, MongoDatabase roomDatabase, MongoDatabase roomHistoryDatabase) {
    machineCollection = machineDatabase.getCollection("machines");
    roomCollection = roomDatabase.getCollection("rooms");
    roomHistoryCollection = roomHistoryDatabase.getCollection("roomsHistory");
  }

  public void updateHistory() {
    Calendar calendar = Calendar.getInstance();

    int today = calendar.get(Calendar.DAY_OF_WEEK);   // SUN -> 1, SAT -> 7
    int now = calendar.get(Calendar.HOUR_OF_DAY) * 2 + calendar.get(Calendar.MINUTE) / 30; // 48 observations per day

    FindIterable<Document> machines = machineCollection.find();
    FindIterable<Document> rooms = roomCollection.find();
    for (Document room: rooms) {
      Document filterDoc = new Document();
      filterDoc = filterDoc.append("room_id", room.get("id"));
      Document targetRoom = roomHistoryCollection.find(filterDoc).first();

      if (targetRoom == null) {
        targetRoom = new Document();
        targetRoom.append("room_id", room.get("id"));
        for (int d = 1; d <= 7; ++d) {
          Document targetDay = new Document();
          for (int t = 0; t < 48; ++t) {
            targetDay.append(String.valueOf(t), 0);
          }
          targetRoom.append(String.valueOf(d), targetDay);
        }
        roomHistoryCollection.insertOne(targetRoom);
      }

      Document targetDay = (Document)targetRoom.get(String.valueOf(today));
      int originalUsage = (int)targetDay.get(String.valueOf(now));

      String roomId = (String)room.get("id");
      Bson filter1 = Filters.eq("status", "normal");
      Bson filter2 = Filters.eq("running", true);
      Bson filter3 = Filters.eq("room_id", roomId);
      FindIterable<Document> runningMachinesInRoom =  machines.filter(and(filter1, filter2, filter3));
      int count = 0;
      for (Document ignored : runningMachinesInRoom) {
        ++count;
      }

      int currentUsage = (int)(originalUsage*0.6 + count*100*0.4);
      targetDay.put(String.valueOf(now), currentUsage);
      targetRoom.put(String.valueOf(today), targetDay);
      roomHistoryCollection.replaceOne(filterDoc, targetRoom);
    }
    System.out.println("[update] INFO history.HistoryController - Updated availability history to window D" + today + "T" + now);
  }

  public String getHistory(String room) {
    Document filterDoc = new Document();
    filterDoc = filterDoc.append("room_id", room);
    return serializeIterable(roomHistoryCollection.find(filterDoc));
  }

  public String getAllHistory() {
    return serializeIterable(roomHistoryCollection.find());
  }

  private String serializeIterable(Iterable<Document> documents) {
    return StreamSupport.stream(documents.spliterator(), false)
      .map(Document::toJson)
      .collect(Collectors.joining(", ", "[", "]"));
  }
}
