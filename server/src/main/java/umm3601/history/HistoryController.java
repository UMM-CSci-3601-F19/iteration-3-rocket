package umm3601.history;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import static com.mongodb.client.model.Filters.eq;

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

  }

}
