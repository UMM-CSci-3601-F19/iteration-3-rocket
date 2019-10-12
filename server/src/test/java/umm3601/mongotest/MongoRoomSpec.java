package umm3601.mongotest;

import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;
import org.bson.Document;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Projections.fields;
import static com.mongodb.client.model.Projections.include;
import static org.junit.Assert.*;
import static org.junit.Assert.assertNotNull;

public class MongoRoomSpec {
  private MongoCollection<Document> roomDocuments;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase db = mongoClient.getDatabase("test");
    roomDocuments = db.getCollection("rooms");
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
    roomDocuments.insertMany(testRooms);
  }

  private List<Document> intoList(MongoIterable<Document> documents) {
    List<Document> rooms = new ArrayList<>();
    documents.into(rooms);
    return rooms;
  }

  private int countRooms(FindIterable<Document> documents) {
    List<Document> rooms = intoList(documents);
    return rooms.size();
  }

  @Test
  public void shouldBeThreeUsers() {
    FindIterable<Document> documents = roomDocuments.find();
    int numberOfRooms = countRooms(documents);
    assertEquals("Should be 2 total rooms", 2, numberOfRooms);
  }

  @Test
  public void shouldBeOneIndy() {
    FindIterable<Document> documents = roomDocuments.find(eq("name", "Independence Hall"));
    int numberOfRooms = countRooms(documents);
    assertEquals("Should be 1 Indy", 1, numberOfRooms);
  }

  @Test
  public void shouldBeOneGayHall() {
    FindIterable<Document> documents = roomDocuments.find(eq("name", "Gay Hall"));
    int numberOfRooms = countRooms(documents);
    assertEquals("Should be 1 Indy", 1, numberOfRooms);
  }

  @Test
  public void justName() {
    FindIterable<Document> documents
      = roomDocuments.find().projection(fields(include("name")));
    List<Document> docs = intoList(documents);
    assertEquals("Should be 2", 2, docs.size());
    assertEquals("First should be Gay Hall", "Gay Hall", docs.get(0).get("name"));
    assertEquals("Second should be Indy", "Independence Hall", docs.get(1).get("name"));
    assertNull("First shouldn't have id", docs.get(0).get("id"));
    assertNull("Second shouldn't have id", docs.get(0).get("id"));
  }

  @Test
  public void justId() {
    FindIterable<Document> documents
      = roomDocuments.find().projection(fields(include("id")));
    List<Document> docs = intoList(documents);
    assertEquals("Should be 2", 2, docs.size());
    assertEquals("First should be gay_hall", "gay_hall", docs.get(0).get("id"));
    assertEquals("Second should be independence_hall", "independence_hall", docs.get(1).get("id"));
    assertNull("First shouldn't have name", docs.get(0).get("name"));
    assertNull("Second shouldn't have name", docs.get(0).get("name"));
  }

}
