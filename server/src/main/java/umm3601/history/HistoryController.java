package umm3601.history;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import org.bson.conversions.Bson;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.mongodb.client.model.Filters.*;

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
    while (roomHistoryCollection.countDocuments() >= 1008) { // store the data of a week
      Document first = roomHistoryCollection.find().first();
      roomHistoryCollection.deleteOne(first);
    }

    FindIterable<Document> machines = machineCollection.find();
    FindIterable<Document> rooms = roomCollection.find();
    Document newDocument = new Document();
    newDocument.put("time", System.currentTimeMillis());
    for (Document room: rooms) {
      String roomId = (String)room.get("id");
      Bson filter1 = Filters.eq("status", "normal");
      Bson filter2 = Filters.eq("running", true);
      Bson filter3 = Filters.eq("room_id", roomId);
      FindIterable<Document> runningMachinesInRoom =  machines.filter(and(filter1, filter2, filter3));
      int count = 0;
//      System.out.println(roomId);
      for (Document ignored : runningMachinesInRoom) {
        ++count;
      }
//      System.out.println(count);
      newDocument.put(roomId, count);
    }
    roomHistoryCollection.insertOne(newDocument);
    System.out.println("[history-controller] INFO - Rooms availability history updated");
  }

  public String getHistory() {
    return serializeIterable(roomHistoryCollection.find().limit(144));
  }

  private String serializeIterable(Iterable<Document> documents) {
    return StreamSupport.stream(documents.spliterator(), false)
      .map(Document::toJson)
      .collect(Collectors.joining(", ", "[", "]"));
  }
}
