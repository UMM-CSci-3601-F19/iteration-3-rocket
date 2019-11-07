/*
package umm3601.history;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.*;
import org.bson.codecs.*;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.json.JsonReader;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.Assert.assertEquals;

public class HistoryControllerSpec {

  private HistoryController historyController;

  private String machineId;
  private String roomId;

  private MongoCollection<Document> roomHistoryDocuments;
  private BasicDBObject machine;


  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase machineDB = mongoClient.getDatabase("test");
    MongoDatabase roomDB = mongoClient.getDatabase("test");
    MongoDatabase roomHistoryDB = mongoClient.getDatabase("test");

    MongoCollection<Document> machineDocuments = machineDB.getCollection("machines");
    machineDocuments.drop();
    List<Document> testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Dryer\"\n" +
      "\t\"running\": \"true\"\n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "\t\"name\": \"Independence Hall\"\n" +
      "\t\"type\": \"Washer\"\n" +
      "\t\"running\": \"false\"\n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"independence\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);

    roomHistoryDocuments = roomHistoryDB.getCollection("roomDataFromHistoryAPI");
    roomHistoryDocuments.drop();
    List<Document> testHistoricRooms = new ArrayList<>();
    testHistoricRooms.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"name\": \"Spooner Hall\"\n" +
      "\t\"type\": \"washer\"\n" +
      "\t\"running\": \"true\"\n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"spooner\"\n" +
      "  }"));
    testHistoricRooms.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "\t\"name\": \"Blakely Hall\"\n" +
      "\t\"type\": \"washer\"\n" +
      "\t\"running\": \"false\"\n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"blakely\"\n" +
      "  }"));
    testHistoricRooms.add(Document.parse("{\n" +
      "\"id\": \"cd840548-7fd2-4a59-87a0-0afabeee0f85\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"dryer\"\n" +
      "\t\"running\": \"true\"\n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    testHistoricRooms.add(Document.parse("{\n" +
      "\"id\": \"cee9ba33-8c10-4b40-8307-c0a8ea9f68f5\",\n" +
      "\t\"name\": \"The Apartments\"\n" +
      "\t\"type\": \"washer\"\n" +
      "\t\"running\": \"true\"\n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"the_apartments\"\n" +
      "  }"));
    roomHistoryDocuments.insertMany(testHistoricRooms);

    MongoCollection<Document> roomDocuments = roomDB.getCollection("rooms");
    roomDocuments.drop();
    List<Document> testRooms = new ArrayList<>();
    testRooms.add(Document.parse("{\n" +
      "\t\"id\": \"cee9ba33-8c10-4b40-8307-c0a8ea9f68f5\",\n" +
      "\t\"name\": \"Independence Hall\"\n" +
      "\t\"type\": \"dryer\"\n" +
      "\t\"running\": \"true\"\n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"independence\"\n" +
      "  }\n"));
    testRooms.add(Document.parse("{\n" +
      "\t\"id\": \"cee9ba33-8c10-4b40-8307-c0a8ea9f68f5\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"dryer\"\n" +
      "\t\"running\": \"false\"\n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }\n"));
    roomId = "a_room";
    BasicDBObject room = new BasicDBObject("id", roomId);
    room = room.append("name", "Pine Hall");
    roomDocuments.insertMany(testRooms);
    roomDocuments.insertOne(Document.parse(room.toJson()));

    // It might be important to construct this _after_ the DB is set up
    // in case there are bits in the constructor that care about the state
    // of the database.
    historyController = new HistoryController(machineDB, roomDB, roomHistoryDB);

    machineId = "8761b8c6-2548-43c9-9d31-ce0b84bcd160";
    machine = new BasicDBObject("id", machineId);
    machine = machine.append("type", "dryer")
      .append("running", true)
      .append("status", "the_status")
      .append("room_id", roomId);
    roomHistoryDocuments.insertOne(Document.parse(machine.toJson()));
  }

  private static String getId(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("room_id")).getValue();
  }

  private static String getStatus(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("status")).getValue();
  }

  private static Boolean getRunning(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonBoolean) doc.get("running")).getValue();
  }

  private BsonArray parseJsonArray(String json) {
    final CodecRegistry codecRegistry
      = CodecRegistries.fromProviders(Arrays.asList(
      new ValueCodecProvider(),
      new BsonValueCodecProvider(),
      new DocumentCodecProvider()));

    JsonReader reader = new JsonReader(json);
    BsonArrayCodec arrayReader = new BsonArrayCodec(codecRegistry);

    return arrayReader.decode(reader, DecoderContext.builder().build());
  }

  @Test
  public void testUpdateHistory() {
    historyController.updateHistory();
  }

  @Test
  public void testGetHistory() {
    // Setup
    String jsonResult = historyController.getHistory("a_room");
    BsonArray docs = parseJsonArray(jsonResult);
    List<String> room = docs
      .stream()
      .map(HistoryControllerSpec::getId)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedResult = Arrays.asList();
    final String result = historyController.getHistory("a_room");
    // Verify the results
    assertEquals(result, jsonResult);
  }

  @Test
  public void testGetAllHistory() {

    String jsonResult = historyController.getAllHistory();
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 2 rooms", 2, docs.size());
    List<String> history = docs
      .stream()
      .map(HistoryControllerSpec::getId)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedHistory = Arrays.asList("a_room", "cee9ba33-8c10-4b40-8307-c0a8ea9f68f5");
    assertEquals("Should match", expectedHistory, history);
  }
}
*/
