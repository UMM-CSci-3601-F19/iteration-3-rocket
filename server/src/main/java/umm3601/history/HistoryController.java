package umm3601.history;

import com.google.gson.JsonObject;
import com.mongodb.DBCursor;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import javax.print.Doc;
import java.sql.Timestamp;
import java.util.Iterator;
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
