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
import spark.Request;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

public class LaundryControllerSpec {

  private LaundryController laundryController;

  private ObjectId machineId;
  private ObjectId roomId;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase machineDB = mongoClient.getDatabase("test");
    MongoDatabase roomDB = mongoClient.getDatabase("test");
    MongoCollection<Document> machineDocuments = machineDB.getCollection("machines");
    machineDocuments.drop();
    List<Document> testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "    \"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "    \"type\": \"washer\",\n" +
      "    \"running\": true,\n" +
      "    \"status\": \"normal\",\n" +
      "    \"room_id\": \"gay_hall\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "    \"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "    \"type\": \"dryer\",\n" +
      "    \"running\": false,\n" +
      "    \"status\": \"normal\",\n" +
      "    \"room_id\": \"independmachineDocumentsence_hall\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "    \"id\": \"cd840548-7fd2-4a59-87a0-0afabeee0f85\",\n" +
      "    \"type\": \"dryer\",\n" +
      "    \"running\": true,\n" +
      "    \"status\": \"broken\",\n" +
      "    \"room_id\": \"pine_hall\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "    \"id\": \"cee9ba33-8c10-4b40-8307-c0a8ea9f68f5\",\n" +
      "    \"type\": \"washer\",\n" +
      "    \"running\": false,\n" +
      "    \"status\": \"invisible\",\n" +
      "    \"room_id\": \"gay_hall\"\n" +
      "  }"));

    machineId = new ObjectId();
    BasicDBObject machine = new BasicDBObject("id", machineId);
    machine = machine.append("type", "dryer")
      .append("running", false)
      .append("status", "broken")
      .append("room_id", roomId);

    machineDocuments.insertMany(testMachines);
    machineDocuments.insertOne(Document.parse(machine.toJson()));

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

    BasicDBObject room = new BasicDBObject("id", "a_room");
    room = room.append("name", "Pine Hall");

    roomDocuments.insertMany(testRooms);
    roomDocuments.insertOne(Document.parse(room.toJson()));

    // It might be important to construct this _after_ the DB is set up
    // in case there are bits in the constructor that care about the state
    // of the database.
    laundryController = new LaundryController(machineDB, roomDB);
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

  private static String getName(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("name")).getValue();
  }

  private static String getType(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("type")).getValue();
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

    assertEquals("Should be 5 machines", 5, docs.size());
    List<String> types = docs
      .stream()
      .map(LaundryControllerSpec::getType)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedTypes = Arrays.asList("dryer", "dryer", "dryer", "washer", "washer");
    assertEquals("Names should match", expectedTypes, types);
  }

  @Test
  public void getAllMachinesAtGayHall() {
    String jsonResult = laundryController.getMachinesAtRoom("gay_hall");
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 2 machines", 2, docs.size());
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
    String jsonResult = laundryController.getMachine(machineId.toHexString());
    Document machine = Document.parse(jsonResult);
    assertEquals("Name should match", "broken", machine.get("status"));
    String noJsonResult = laundryController.getMachine(new ObjectId().toString());
    assertNull("No name should match", noJsonResult);
  }
}
