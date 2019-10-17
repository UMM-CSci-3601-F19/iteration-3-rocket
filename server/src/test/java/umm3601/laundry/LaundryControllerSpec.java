package umm3601.laundry;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.*;
import org.bson.codecs.*;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.json.JsonReader;
import org.bson.types.ObjectId;
import org.junit.Before;
import org.junit.Test;

import java.sql.Array;
import java.util.*;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

public class LaundryControllerSpec {

  private LaundryController laundryController;

  private String machineId;
  private String roomId;

  private MongoCollection<Document> machinePollingDocuments;
  private BasicDBObject machine;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase machineDB = mongoClient.getDatabase("test");
    MongoDatabase roomDB = mongoClient.getDatabase("test");
    MongoDatabase machinePollingDB = mongoClient.getDatabase("test");

    MongoCollection<Document> machineDocuments = machineDB.getCollection("machines");
    machineDocuments.drop();
    List<Document> testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "    \"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "    \"type\": \"washer\",\n" +
      "    \"running\": false,\n" +
      "    \"status\": \"broken\",\n" +
      "    \"room_id\": \"gay_hall\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "    \"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "    \"type\": \"dryer\",\n" +
      "    \"running\": true,\n" +
      "    \"status\": \"invisible\",\n" +
      "    \"room_id\": \"independence_hall\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);

    machinePollingDocuments = machinePollingDB.getCollection("machineDataFromPollingAPI");
    machinePollingDocuments.drop();
    List<Document> testPollingMachines = new ArrayList<>();
    testPollingMachines.add(Document.parse("{\n" +
      "    \"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "    \"type\": \"washer\",\n" +
      "    \"running\": true,\n" +
      "    \"status\": \"normal\",\n" +
      "    \"room_id\": \"gay_hall\"\n" +
      "  }"));
    testPollingMachines.add(Document.parse("{\n" +
      "    \"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "    \"type\": \"dryer\",\n" +
      "    \"running\": false,\n" +
      "    \"status\": \"normal\",\n" +
      "    \"room_id\": \"independence_hall\"\n" +
      "  }"));
    testPollingMachines.add(Document.parse("{\n" +
      "    \"id\": \"cd840548-7fd2-4a59-87a0-0afabeee0f85\",\n" +
      "    \"type\": \"dryer\",\n" +
      "    \"running\": true,\n" +
      "    \"status\": \"normal\",\n" +
      "    \"room_id\": \"pine_hall\"\n" +
      "  }"));
    testPollingMachines.add(Document.parse("{\n" +
      "    \"id\": \"cee9ba33-8c10-4b40-8307-c0a8ea9f68f5\",\n" +
      "    \"type\": \"washer\",\n" +
      "    \"running\": false,\n" +
      "    \"status\": \"normal\",\n" +
      "    \"room_id\": \"gay_hall\"\n" +
      "  }"));
    machinePollingDocuments.insertMany(testPollingMachines);

    MongoCollection<Document> roomDocuments = roomDB.getCollection("rooms");
    roomDocuments.drop();
    List<Document> testRooms = new ArrayList<>();
    testRooms.add(Document.parse("{\n" +
      "\t\"id\": \"gay_hall\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "  }\n"));
    testRooms.add(Document.parse("{\n" +
      "\t\"id\": \"independence_hall\",\n" +
      "\t\"name\": \"Independence Hall\"\n" +
      "  }\n"));
    roomId = "a_room";
    BasicDBObject room = new BasicDBObject("id", roomId);
    room = room.append("name", "Pine Hall");
    roomDocuments.insertMany(testRooms);
    roomDocuments.insertOne(Document.parse(room.toJson()));

    // It might be important to construct this _after_ the DB is set up
    // in case there are bits in the constructor that care about the state
    // of the database.
    laundryController = new LaundryController(machineDB, roomDB, machinePollingDB);

    machineId = "8761b8c6-2548-43c9-9d31-ce0b84bcd160";
    machine = new BasicDBObject("id", machineId);
    machine = machine.append("type", "dryer")
      .append("running", false)
      .append("status", "the_status")
      .append("room_id", roomId);
    machinePollingDocuments.insertOne(Document.parse(machine.toJson()));
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

  private static Integer getRemainingTime(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonInt32) doc.get("remainingTime")).getValue();
  }

  private static Integer getVacantTime(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonInt32) doc.get("vacantTime")).getValue();
  }

  private static String getName(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("name")).getValue();
  }

  private static String getType(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("type")).getValue();
  }

  private static String getStatus(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("status")).getValue();
  }

  private static Boolean getRunning(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonBoolean) doc.get("running")).getValue();
  }

  @Test
  public void getAllRooms() {
    String jsonResult = laundryController.getRooms();
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 3 rooms", 3, docs.size());
    List<String> names = docs
      .stream()
      .map(LaundryControllerSpec::getName)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedNames = Arrays.asList("Gay Hall", "Independence Hall", "Pine Hall");
    assertEquals("Names should match", expectedNames, names);
  }

  @Test
  public void getAllMachines() {
    String jsonResult = laundryController.getMachines();
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be updated with 5 machines", 5, docs.size());
    List<String> types = docs
      .stream()
      .map(LaundryControllerSpec::getType)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedTypes = Arrays.asList("dryer", "dryer", "dryer", "washer", "washer");
    assertEquals("Types should match", expectedTypes, types);
    List<String> status = docs
      .stream()
      .map(LaundryControllerSpec::getStatus)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedStatus = Arrays.asList("normal", "normal", "normal", "normal", "the_status");
    assertEquals("Status should be updated", expectedStatus, status);
    List<Boolean> running = docs
      .stream()
      .map(LaundryControllerSpec::getRunning)
      .sorted()
      .collect(Collectors.toList());
    List<Boolean> expectedRunning = Arrays.asList(false, false, false, true, true);
    assertEquals("Running should be updated", expectedRunning, running);
  }

  @Test
  public void updateTime() {
    String jsonResult = laundryController.getMachines();
    BsonArray docs = parseJsonArray(jsonResult);

    List<Integer> remainingTimes = docs
      .stream()
      .map(LaundryControllerSpec::getRemainingTime)
      .collect(Collectors.toList());
    List<Integer> expectedRemainingTimes = Arrays.asList(60, -1, 60, -1, -1);
    assertEquals("Running should be updated", expectedRemainingTimes, remainingTimes);

    List<Integer> vacantTimes = docs
      .stream()
      .map(LaundryControllerSpec::getVacantTime)
      .collect(Collectors.toList());
    List<Integer> expectedVacantTimes = Arrays.asList(-1, 0, -1, 0, 0);
    assertEquals("Running should be updated", expectedVacantTimes, vacantTimes);

    machineId = "8761b8c6-2548-43c9-9d31-ce0b84bcd160";
    BasicDBObject newMachine = new BasicDBObject("id", machineId);
    newMachine = newMachine.append("type", "dryer")
      .append("running", true)
      .append("status", "the_status")
      .append("room_id", roomId);
    machinePollingDocuments.replaceOne(Document.parse(machine.toJson()), Document.parse(newMachine.toJson()));

    jsonResult = laundryController.getMachines();
    docs = parseJsonArray(jsonResult);

    remainingTimes = docs
      .stream()
      .map(LaundryControllerSpec::getRemainingTime)
      .collect(Collectors.toList());
    expectedRemainingTimes = Arrays.asList(60, -1, 60, -1, 60);
    assertEquals("Running should be updated", expectedRemainingTimes, remainingTimes);

    vacantTimes = docs
      .stream()
      .map(LaundryControllerSpec::getVacantTime)
      .collect(Collectors.toList());
    expectedVacantTimes = Arrays.asList(-1, 0, -1, 0, -1);
    assertEquals("Running should be updated", expectedVacantTimes, vacantTimes);
  }

  @Test
  public void getAllMachinesAtGayHall() {
    String jsonResult = laundryController.getMachinesAtRoom("gay_hall");
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be updated with 2 machines", 2, docs.size());
    List<String> types = docs
      .stream()
      .map(LaundryControllerSpec::getType)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedTypes = Arrays.asList("washer", "washer");
    assertEquals("Names should match", expectedTypes, types);
  }

  @Test
  public void getMachineById() {
    String jsonResult = laundryController.getMachine(machineId);
    Document machine = Document.parse(jsonResult);
    assertEquals("Status should match", "the_status", machine.get("status"));
    String noJsonResult = laundryController.getMachine(new ObjectId().toString());
    assertNull("Nothing should match", noJsonResult);
  }
}
