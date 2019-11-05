//package umm3601.history;
//
//import com.mongodb.BasicDBObject;
//import com.mongodb.MongoClient;
//import com.mongodb.client.MongoCollection;
//import com.mongodb.client.MongoDatabase;
//import org.bson.*;
//import org.bson.codecs.*;
//import org.bson.codecs.configuration.CodecRegistries;
//import org.bson.codecs.configuration.CodecRegistry;
//import org.bson.json.JsonReader;
//import org.bson.types.ObjectId;
//import org.junit.Before;
//import org.junit.Test;
//
//import java.util.*;
//import java.util.stream.Collectors;
//
//import static org.junit.Assert.*;
//
//public class HistoryControllerSpec {
//
//  private HistoryController historyController;
//
//  private String machineId;
//  private String roomId;
//
//  private MongoCollection<Document> roomHistoryDocuments;
//  private BasicDBObject room;
//  private BasicDBObject machine;
//
//
//  @Before
//  public void clearAndPopulateDB() {
//    MongoClient mongoClient = new MongoClient();
//    MongoDatabase machineDB = mongoClient.getDatabase("");
//    MongoDatabase roomDB = mongoClient.getDatabase("");
//    MongoDatabase roomHistoryDB = mongoClient.getDatabase("");
//
//    MongoCollection<Document> machineDocuments = machineDB.getCollection("machines");
//    machineDocuments.drop();
//    List<Document> testMachines = new ArrayList<>();
//    testMachines.add(Document.parse("{\n" +
//      "    \"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
//      "    \"gay_hall\": \6\\n" +
//      "  }"));
//    testMachines.add(Document.parse("{\n" +
//      "    \"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
//      "    \"independence_hall\": \3\\n" +
//      "    \"Position\": \3\\n" +
//      "  }"));
//    machineDocuments.insertMany(testMachines);
//
//    roomHistoryDocuments = roomHistoryDB.getCollection("roomDataFromHistoryAPI");
//    roomHistoryDocuments.drop();
//    List<Document> testHistoricRooms = new ArrayList<>();
//    testHistoricRooms.add(Document.parse("{\n" +
//      "    \"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
//      "    \"gay_hall\": \4\\n" +
//      "    \"Position\": \3\\n" +
//      "  }"));
//    testHistoricRooms.add(Document.parse("{\n" +
//      "    \"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
//      "    \"independence_hall\": \5\\n" +
//      "    \"Position\": \3\\n" +
//      "  }"));
//    testHistoricRooms.add(Document.parse("{\n" +
//      "    \"id\": \"cd840548-7fd2-4a59-87a0-0afabeee0f85\",\n" +
//      "    \"pine_hall\": \3\\n" +
//      "    \"Position\": \3\\n" +
//      "  }"));
//    testHistoricRooms.add(Document.parse("{\n" +
//      "    \"id\": \"cee9ba33-8c10-4b40-8307-c0a8ea9f68f5\",\n" +
//      "    \"gay_hall\": \7\\n" +
//      "    \"Position\": \3\\n" +
//      "  }"));
//    roomHistoryDocuments.insertMany(testHistoricRooms);
//
//    MongoCollection<Document> roomDocuments = roomDB.getCollection("rooms");
//    roomDocuments.drop();
//    List<Document> testRooms = new ArrayList<>();
//    testRooms.add(Document.parse("{\n" +
//      "\t\"gay_hall\": \"gay_hall\",\n" +
//      "\t\"name\": \"Gay Hall\"\n" +
//      "    \"Position\": \3\\n" +
//      "  }\n"));
//    testRooms.add(Document.parse("{\n" +
//      "\t\"id\": \"independence_hall\",\n" +
//      "\t\"name\": \"Independence Hall\"\n" +
//      "    \"Position\": \3\\n" +
//      "  }\n"));
//    roomId = "a_room";
//    BasicDBObject room = new BasicDBObject("id", roomId);
//    room = room.append("name", "Pine Hall");
//    roomDocuments.insertMany(testRooms);
//    roomDocuments.insertOne(Document.parse(room.toJson()));
//
//    // It might be important to construct this _after_ the DB is set up
//    // in case there are bits in the constructor that care about the state
//    // of the database.
//    historyController = new HistoryController(machineDB, roomDB, roomHistoryDB);
//
//    machineId = "8761b8c6-2548-43c9-9d31-ce0b84bcd160";
//    machine = new BasicDBObject("id", machineId);
//    machine = machine.append("type", "dryer")
//      .append("running", true)
//      .append("status", "the_status")
//      .append("room_id", roomId);
//    roomHistoryDocuments.insertOne(Document.parse(machine.toJson()));
//  }
//
//  private BsonArray parseJsonArray(String json) {
//    final CodecRegistry codecRegistry
//      = CodecRegistries.fromProviders(Arrays.asList(
//      new ValueCodecProvider(),
//      new BsonValueCodecProvider(),
//      new DocumentCodecProvider()));
//
//    JsonReader reader = new JsonReader(json);
//    BsonArrayCodec arrayReader = new BsonArrayCodec(codecRegistry);
//
//    return arrayReader.decode(reader, DecoderContext.builder().build());
//  }
//
//  private static Integer getMachinesRan(BsonValue val) {
//    BsonDocument doc = val.asDocument();
//    return ((BsonInt32) doc.get("machinesRan")).getValue();
//  }
//
//  private static String getId(BsonValue val) {
//    BsonDocument doc = val.asDocument();
//    return ((BsonString) doc.get("room_id")).getValue();
//  }
//
//  private static String getStatus(BsonValue val) {
//    BsonDocument doc = val.asDocument();
//    return ((BsonString) doc.get("status")).getValue();
//  }
//
//  private static Boolean getRunning(BsonValue val) {
//    BsonDocument doc = val.asDocument();
//    return ((BsonBoolean) doc.get("running")).getValue();
//  }
//
//  @Test
//  public void getAllRooms() {
//    String jsonResult = historyController.getHistory(roomId);
//    BsonArray docs = parseJsonArray(jsonResult);
//
//    assertEquals("Should be 1 Id", 1, docs.size());
//    List<String> ids = docs
//      .stream()
//      .map(HistoryControllerSpec::getId)
//      .sorted()
//      .collect(Collectors.toList());
//    List<String> expectedIds = Arrays.asList("a_room");
//    assertEquals("Id should match", expectedIds, ids);
//  }
//
//  @Test
//  public void getAllMachines() {
//    historyController.updateHistory();
//    String jsonResult = historyController.getHistory(roomId);
//    BsonArray docs = parseJsonArray(jsonResult);
//
//    assertEquals("Should be updated with 1 machine", 1, docs.size());
//    List<String> status = docs
//      .stream()
//      .map(HistoryControllerSpec::getStatus)
//      .sorted()
//      .collect(Collectors.toList());
//    List<String> expectedStatus = Arrays.asList("normal", "normal", "normal", "normal", "the_status");
//    assertEquals("Status should be updated", expectedStatus, status);
//    List<Boolean> running = docs
//      .stream()
//      .map(HistoryControllerSpec::getRunning)
//      .sorted()
//      .collect(Collectors.toList());
//    List<Boolean> expectedRunning = Arrays.asList(false, false, false, true, true);
//    assertEquals("Running should be updated", expectedRunning, running);
//    List<String> ids = docs
//      .stream()
//      .map(HistoryControllerSpec::getId)
//      .sorted()
//      .collect(Collectors.toList());
//    List<String> expectedIds = Arrays.asList("", "", "", "", "");
//    assertEquals("Id's should be updated", expectedIds, ids);
//  }
//
//  @Test
//  public void updateRanMachine() {
//    historyController.updateHistory();
//    String jsonResult = historyController.getHistory(machineId);
//    BsonArray docs = parseJsonArray(jsonResult);
//
//    List<Integer> machinesRan = docs
//      .stream()
//      .map(HistoryControllerSpec::getMachinesRan)
//      .collect(Collectors.toList());
//    List<Integer> expectedMachinesRan = Arrays.asList();
//    assertEquals("Running should be updated", expectedMachinesRan, machinesRan);
//
//    machineId = "8761b8c6-2548-43c9-9d31-ce0b84bcd160";
//    BasicDBObject newMachine = new BasicDBObject("id", machineId);
//    newMachine = newMachine.append("type", "washer")
//      .append("running", true)
//      .append("status", "the_status")
//      .append("room_id", roomId);
//    roomHistoryDocuments.replaceOne(Document.parse(machine.toJson()), Document.parse(newMachine.toJson()));
//  }
//
//  @Test
//  public void getAllHistoricMachinesAtGayHall() {
//    historyController.updateHistory();
//    String jsonResult = historyController.getHistory("gay_hall");
//    BsonArray docs = parseJsonArray(jsonResult);
//
//    assertEquals("Should be updated with 1 machine", 1, docs.size());
//    List<String> room = docs
//      .stream()
//      .map(HistoryControllerSpec::getId)
//      .sorted()
//      .collect(Collectors.toList());
//    List<String> expectedRoom = Arrays.asList("gay_hall");
//    assertEquals("Rooms should match", expectedRoom, room);
//  }
//
//  @Test
//  public void getMachinesByRoom() {
//    historyController.updateHistory();
//    String jsonResult = historyController.getHistory(roomId);
//    Document room = Document.parse(jsonResult);
//    assertEquals("Ids should match", "room_id", room.get(roomId));
//    String noJsonResult = historyController.getHistory(new ObjectId().toString());
//    assertNull("Nothing should match", noJsonResult);
//  }
//}
