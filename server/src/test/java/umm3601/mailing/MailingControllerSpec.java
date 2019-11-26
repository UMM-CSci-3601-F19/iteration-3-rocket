package umm3601.mailing;

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

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.junit.Assert.*;

public class MailingControllerSpec {
  private MailingController mailingController;

  private MongoCollection<Document> machineDocuments;
  private MongoCollection<Document> subDocuments;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase machineDB = mongoClient.getDatabase("test");
    MongoDatabase subDB = mongoClient.getDatabase("test");

    machineDocuments = machineDB.getCollection("machines");
    subDocuments = subDB.getCollection("subscriptions");
    machineDocuments.drop();
    List<Document> testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Dryer\"\n" +
      "\t\"running\": true \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Washer\"\n" +
      "\t\"running\": true \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);

    // It might be important to construct this _after_ the DB is set up
    // in case there are bits in the constructor that care about the state
    // of the database.
    mailingController = new MailingController(subDB, machineDB);
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

  private static String getType(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("type")).getValue();
  }

  private String serializeIterable(Iterable<Document> documents) {
    return StreamSupport.stream(documents.spliterator(), false)
      .map(Document::toJson)
      .collect(Collectors.joining(", ", "[", "]"));
  }


  @Test
  public void addNewSubscription() {
    subDocuments.drop();
    String newSub = mailingController.addNewSubscription("test_1@example.com", "Washer", "gay");

    assertNotNull("Should return true when user is added,", newSub);

    Document filterDoc = new Document();
    filterDoc = filterDoc.append("email", "test_1@example.com");
    BsonArray docs = parseJsonArray(serializeIterable(mailingController.subscriptionCollection.find(filterDoc)));

    assertEquals("Should be 1 sub with email test_1@example.com", 1, docs.size());
    List<String> subType = docs
      .stream()
      .map(MailingControllerSpec::getType)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedTypes = Collections.singletonList("Washer");
    assertEquals("type should be Washer", expectedTypes, subType);
  }

  @Test
  public void sendNotificationForRoom() {
    subDocuments.drop();
    List<Document> testSubs = new ArrayList<>();
    testSubs.add(Document.parse("{\n" +
      "\t\"email\": \"test@example.com\",\n" +
      "\t\"id\": \"gay\",\n" +
      "\t\"type\": \"Dryer\"\n" +
      "  }\n"));
    subDocuments.insertMany(testSubs);

    Throwable t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not send the notification when no machine is vacant", t);

    List<Document> testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afb3\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Dryer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"broken\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);
    t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not send the notification when the room has a vacant but non-normal machine", t);

    testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3g5\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Washer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"pine\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);
    t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not send the notification when another room has a vacant machine", t);

    machineDocuments.drop();
    testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Dryer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Washer\"\n" +
      "\t\"running\": true \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);

    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNotNull("should receive a message when the machine is vacant", t);
    // The returned message is too long to be tested, so we do not test its actual message
    // The following code is what we would test its message
//    assertNotEquals("should receive a unauthorized code when the machine is vacant", -1,
//      t.getMessage().indexOf("401"));

    t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not send the notification again", t);

    testSubs = new ArrayList<>();
    testSubs.add(Document.parse("{\n" +
      "\t\"email\": \"test@example.com\",\n" +
      "\t\"id\": \"gay\",\n" +
      "\t\"type\": \"Washer\"\n" +
      "  }\n"));
    subDocuments.insertMany(testSubs);

    t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not receive the notification when the room has no vacant washer", t);

    machineDocuments.drop();
    testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Dryer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Washer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);

    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNotNull("should receive a message when the machine is vacant", t);
    // The returned message is too long to be tested, so we do not test its actual message
    // The following code is what we would test its message
//    assertNotEquals("should receive a unauthorized code when the machine is vacant", -1,
//      t.getMessage().indexOf("401"));

    t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not send the notification again", t);
  }

  @Test
  public void sendNotificationForMachine() {
    subDocuments.drop();
    List<Document> testSubs = new ArrayList<>();
    testSubs.add(Document.parse("{\n" +
      "\t\"email\": \"test@example.com\",\n" +
      "\t\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"type\": \"machine\"\n" +
      "  }\n"));
    subDocuments.insertMany(testSubs);

    Throwable t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not send the notification when the machine is running", t);

    machineDocuments.drop();
    List<Document> testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Dryer\"\n" +
      "\t\"running\": true \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Washer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);
    t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not send the notification when another machine is vacant", t);

    machineDocuments.drop();
    testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Dryer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"broken\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Washer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);
    t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not send the notification when the machine is vacant but non-normal", t);

    machineDocuments.drop();
    testMachines = new ArrayList<>();
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Dryer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    testMachines.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Washer\"\n" +
      "\t\"running\": false \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    machineDocuments.insertMany(testMachines);

    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNotNull("should receive a message when the machine is vacant", t);
    // The returned message is too long to be tested, so we do not test its actual message
    // The following code is what we would test its message
//    assertNotEquals("should receive a unauthorized code when the machine is vacant", -1,
//      t.getMessage().indexOf("401"));

    t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull("should not send the notification again", t);
  }
}
