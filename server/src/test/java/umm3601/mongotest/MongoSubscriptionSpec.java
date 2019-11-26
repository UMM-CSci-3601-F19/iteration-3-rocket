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

public class MongoSubscriptionSpec {
  private MongoCollection<Document> subscriptionDocuments;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase db = mongoClient.getDatabase("test");
    subscriptionDocuments = db.getCollection("rooms");
    subscriptionDocuments.drop();
    List<Document> testSubscription = new ArrayList<>();
    testSubscription.add(Document.parse("{\n" +
      "\"id\": \"ba9111e9-113f-4bdb-9580-fb098540afa3\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Dryer\"\n" +
      "\t\"running\": true \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    testSubscription.add(Document.parse("{\n" +
      "\"id\": \"bee93873-85c5-48a8-9bba-f0f27ffea3d5\",\n" +
      "\t\"name\": \"Gay Hall\"\n" +
      "\t\"type\": \"Washer\"\n" +
      "\t\"running\": true \n" +
      "\t\"status\": \"normal\"\n" +
      "\t\"room_id\": \"gay\"\n" +
      "  }"));
    subscriptionDocuments.insertMany(testSubscription);
  }
  private List<Document> intoList(MongoIterable<Document> documents) {
    List<Document> subscriptions = new ArrayList<>();
    documents.into(subscriptions);
    return subscriptions;
  }

  private int countSubscriptions(FindIterable<Document> documents) {
    List<Document> subscriptions = intoList(documents);
    return subscriptions.size();
  }

  @Test
  public void shouldBeThreeRooms() {
    FindIterable<Document> documents = subscriptionDocuments.find();
    int numberOfSubscriptions = countSubscriptions(documents);
    assertEquals("Should be 2 total subscriptions", 2, numberOfSubscriptions);
  }

  @Test
  public void shouldBeTwoGayHall() {
    FindIterable<Document> documents = subscriptionDocuments.find(eq("name", "Gay Hall"));
    int numberOfSubscriptions = countSubscriptions(documents);
    assertEquals("Should be 2 Indy", 2, numberOfSubscriptions);
  }

  @Test
  public void justName() {
    FindIterable<Document> documents
      = subscriptionDocuments.find().projection(fields(include("name")));
    List<Document> docs = intoList(documents);
    assertEquals("Should be 2", 2, docs.size());
    assertEquals("First should be Gay Hall", "Gay Hall", docs.get(0).get("name"));
    assertEquals("Second should be Gay Hall", "Gay Hall", docs.get(1).get("name"));
    assertNull("First shouldn't have id", docs.get(0).get("id"));
    assertNull("Second shouldn't have id", docs.get(1).get("id"));
  }

  @Test
  public void justId() {
    FindIterable<Document> documents
      = subscriptionDocuments.find().projection(fields(include("id")));
    List<Document> docs = intoList(documents);
    assertEquals("Should be 2", 2, docs.size());
    assertEquals("First should be ba9111e9-113f-4bdb-9580-fb098540afa3", "ba9111e9-113f-4bdb-9580-fb098540afa3", docs.get(0).get("id"));
    assertEquals("Second should be bee93873-85c5-48a8-9bba-f0f27ffea3d5", "bee93873-85c5-48a8-9bba-f0f27ffea3d5", docs.get(1).get("id"));
    assertNull("First shouldn't have name", docs.get(0).get("name"));
    assertNull("Second shouldn't have name", docs.get(0).get("name"));
  }
}
