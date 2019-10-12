package umm3601.mongotest;

import com.mongodb.MongoClient;
import com.mongodb.client.*;
import org.bson.Document;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Projections.fields;
import static com.mongodb.client.model.Projections.include;
import static org.junit.Assert.*;

public class MongoMachineSpec {
  private MongoCollection<Document> machineDocuments;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase db = mongoClient.getDatabase("test");
    machineDocuments = db.getCollection("rooms");
    machineDocuments.drop();
    List<Document> testRooms = new ArrayList<>();
    testRooms.add(Document.parse("{\n" +
      "    \"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "    \"type\": \"washer\",\n" +
      "    \"running\": true,\n" +
      "    \"status\": \"normal\",\n" +
      "    \"room_id\": \"gay_hall\"\n" +
      "  }"));
    testRooms.add(Document.parse("{\n" +
      "    \"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "    \"type\": \"dryer\",\n" +
      "    \"running\": false,\n" +
      "    \"status\": \"normal\",\n" +
      "    \"room_id\": \"independence_hall\"\n" +
      "  }"));
    testRooms.add(Document.parse("{\n" +
      "    \"id\": \"cd840548-7fd2-4a59-87a0-0afabeee0f85\",\n" +
      "    \"type\": \"dryer\",\n" +
      "    \"running\": true,\n" +
      "    \"status\": \"broken\",\n" +
      "    \"room_id\": \"pine_hall\"\n" +
      "  }"));
    testRooms.add(Document.parse("{\n" +
      "    \"id\": \"cee9ba33-8c10-4b40-8307-c0a8ea9f68f5\",\n" +
      "    \"type\": \"washer\",\n" +
      "    \"running\": false,\n" +
      "    \"status\": \"invisible\",\n" +
      "    \"room_id\": \"gay_hall\"\n" +
      "  }"));
    machineDocuments.insertMany(testRooms);
  }

  private List<Document> intoList(MongoIterable<Document> documents) {
    List<Document> machines = new ArrayList<>();
    documents.into(machines);
    return machines;
  }

  private int countMachines(FindIterable<Document> documents) {
    List<Document> machines = intoList(documents);
    return machines.size();
  }

  @Test
  public void shouldBeFourMachines() {
    FindIterable<Document> documents = machineDocuments.find();
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 4 total machines", 4, numberOfMachines);
  }

  @Test
  public void shouldBeOneWasher() {
    FindIterable<Document> documents = machineDocuments.find(eq("type", "washer"));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 2 washer", 2, numberOfMachines);
  }

  @Test
  public void shouldBeOneDryer() {
    FindIterable<Document> documents = machineDocuments.find(eq("type", "dryer"));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 2 dryer", 2, numberOfMachines);
  }

  @Test
  public void shouldBeTwoNormal() {
    FindIterable<Document> documents = machineDocuments.find(eq("status", "normal"));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 2 normal", 2, numberOfMachines);
  }

  @Test
  public void shouldBeOneBroken() {
    FindIterable<Document> documents = machineDocuments.find(eq("status", "broken"));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 1 broken", 1, numberOfMachines);
  }

  @Test
  public void shouldBeOneInvisible() {
    FindIterable<Document> documents = machineDocuments.find(eq("status", "invisible"));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 1 invisible", 1, numberOfMachines);
  }

  @Test
  public void shouldBeTwoRunning() {
    FindIterable<Document> documents = machineDocuments.find(eq("running", true));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 2 running", 2, numberOfMachines);
  }

  @Test
  public void shouldBeTwoNotRunning() {
    FindIterable<Document> documents = machineDocuments.find(eq("running", false));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 2 not running", 2, numberOfMachines);
  }

  @Test
  public void shouldBeTwoGayHall() {
    FindIterable<Document> documents = machineDocuments.find(eq("room_id", "gay_hall"));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 2 Gay Hall", 2, numberOfMachines);
  }

  @Test
  public void shouldBeOneIndy() {
    FindIterable<Document> documents = machineDocuments.find(eq("room_id", "independence_hall"));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 1 Indy", 1, numberOfMachines);
  }

  @Test
  public void shouldBeOnePineHall() {
    FindIterable<Document> documents = machineDocuments.find(eq("room_id", "pine_hall"));
    int numberOfMachines = countMachines(documents);
    assertEquals("Should be 1 pine hall", 1, numberOfMachines);
  }

  @Test
  public void justIdAndType() {
    FindIterable<Document> documents
      = machineDocuments.find().projection(fields(include("id", "type")));
    List<Document> docs = intoList(documents);
    assertEquals("Should be 4", 4, docs.size());
    assertEquals("First id should match", "ba9111e9-113f-4bdb-9580-fb098540afa3", docs.get(0).get("id"));
    assertEquals("First should be Washer", "washer", docs.get(0).get("type"));
    assertNull("First shouldn't have running", docs.get(0).get("running"));
    assertNull("First shouldn't have status", docs.get(0).get("status"));
    assertNull("First shouldn't have room", docs.get(0).get("room_id"));
  }

  @Test
  public void justRunningAndStatus() {
    FindIterable<Document> documents
      = machineDocuments.find().projection(fields(include("running", "status")));
    List<Document> docs = intoList(documents);
    assertEquals("Should be 4", 4, docs.size());
    assertEquals("First should be running", true, docs.get(0).get("running"));
    assertEquals("Second should be normal", "normal", docs.get(0).get("status"));
    assertNull("First shouldn't have id", docs.get(0).get("id"));
    assertNull("First shouldn't have type", docs.get(0).get("type"));
    assertNull("First shouldn't have room", docs.get(0).get("room"));
  }

  @Test
  public void justRoom() {
    FindIterable<Document> documents
      = machineDocuments.find().projection(fields(include("room_id")));
    List<Document> docs = intoList(documents);
    assertEquals("Should be 4", 4, docs.size());
    assertEquals("First should be Gay Hall", "gay_hall", docs.get(0).get("room_id"));
    assertNull("First shouldn't have id", docs.get(0).get("id"));
    assertNull("First shouldn't have type", docs.get(0).get("type"));
    assertNull("First shouldn't have running", docs.get(0).get("running"));
    assertNull("First shouldn't have status", docs.get(0).get("status"));
  }
}
