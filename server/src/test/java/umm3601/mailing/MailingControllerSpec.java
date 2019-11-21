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

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase machineDB = mongoClient.getDatabase("test");
    MongoDatabase subDB = mongoClient.getDatabase("test");

    machineDocuments = machineDB.getCollection("machines");
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

    MongoCollection<Document> subDocuments = subDB.getCollection("subscriptions");
    subDocuments.drop();
    List<Document> testSubs = new ArrayList<>();
    testSubs.add(Document.parse("{\n" +
      "\t\"email\": \"test@example.com\",\n" +
      "\t\"room_id\": \"gay\",\n" +
      "\t\"type\": \"Dryer\"\n" +
      "  }\n"));
    subDocuments.insertMany(testSubs);

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
  public void getSubTest() {
    String newSub = mailingController.addNewSubscription("test_1@example.com", "Washer", "gay");

    assertNotNull("Add new sub should return true when user is added,", newSub);

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
  public void sendNotification() {
    Throwable t = null;
    try {
      mailingController.checkSubscriptions();
    } catch (IOException e) {
      t = e;
    }
    assertNull(t);

    machineDocuments.drop();
    List<Document> testMachines = new ArrayList<>();
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
    assertNotNull(t);
    assertEquals("should receive a 401 error due to the fake test key", "Request returned status Code 401Body:{\"errors\":[{\"message\":\"The provided authorization grant is invalid, expired, or revoked\",\"field\":null,\"help\":null}]}",
      t.getMessage());
  }
}
