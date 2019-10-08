package umm3601.user;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.*;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;

public class UserSummarySpec {

  private UserController userController;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase db = mongoClient.getDatabase("test");
    MongoCollection<Document> userDocuments = db.getCollection("users");
    userDocuments.drop();

    List<Document> testUsers = generateTestUsers();
    userDocuments.insertMany(testUsers);

    // It might be important to construct this _after_ the DB is set up
    // in case there are bits in the constructor that care about the state
    // of the database.
    userController = new UserController(db);
  }

  /**
   * Generate a bunch of test users so we know what to expect
   * in these tests.
   *
   * @return a list of test users
   */
  private List<Document> generateTestUsers() {
    List<Document> testUsers = new ArrayList<>();
    testUsers.add(Document.parse("{\n" +
      "name: \"Chris\",\n" +
      "age: 25,\n" +
      "company: \"Caxt\",\n" +
      "email: \"chris@this.that\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Pat\",\n" +
      "age: 37,\n" +
      "company: \"Blurrybus\",\n" +
      "email: \"pat@something.com\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Jamie\",\n" +
      "age: 37,\n" +
      "company: \"Caxt\",\n" +
      "email: \"jamie@frogs.com\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Diana Wolf\",\n" +
      "age: 44,\n" +
      "company: \"Caxt\",\n" +
      "email: \"undefined.undefined@caxt.us\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Mia Avila\",\n" +
      "age: 39,\n" +
      "company: \"Caxt\",\n" +
      "email: \"undefined.undefined@caxt.io\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Flores Cannon\",\n" +
      "age: 31,\n" +
      "company: \"Blurrybus\",\n" +
      "email: \"undefined.undefined@blurrybus.biz\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Ferrell Lopez\",\n" +
      "age: 57,\n" +
      "company: \"Eschoir\",\n" +
      "email: \"undefined.undefined@eschoir.name\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Pat Smith\",\n" +
      "age: 27,\n" +
      "company: \"Eschoir\",\n" +
      "email: \"undefined.undefined@eschoir.name\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Julia Gutierrez\",\n" +
      "age: 51,\n" +
      "company: \"Eschoir\",\n" +
      "email: \"undefined.undefined@eschoir.me\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Lea Baxter\",\n" +
      "age: 63,\n" +
      "company: \"Blurrybus\",\n" +
      "email: \"undefined.undefined@blurrybus.tv\"\n" +
      "}"));
    testUsers.add(Document.parse("{\n" +
      "name: \"Bianca Walls\",\n" +
      "age: 29,\n" +
      "company: \"Caxt\",\n" +
      "email: \"undefined.undefined@caxt.biz\"\n" +
      "}"));
    return testUsers;
  }

  @Test
  public void checkSummary() {
    String jsonResult = userController.getUserSummary();
    BsonDocument doc = BsonDocument.parse(jsonResult);

    assertEquals("Incorrect number of summaries", 3, doc.size());

    checkCompanySummary(doc.get("Blurrybus"), 0, 2, 1);
    checkCompanySummary(doc.get("Caxt"), 2, 3, 0);
    checkCompanySummary(doc.get("Eschoir"), 1, 1, 1);
  }

  private void checkCompanySummary(BsonValue entry, int numUnder30, int between30and55, int over55) {
    assertEquals("Incorrect under 30", numUnder30, getSummaryField(entry, "under30"));
    assertEquals("Incorrect between 30 and 55", between30and55, getSummaryField(entry, "between30and55"));
    assertEquals("Incorrect over 55", over55, getSummaryField(entry, "over55"));
  }

  private int getSummaryField(BsonValue entry, String fieldName) {
    BsonDocument doc = entry.asDocument();
    final BsonValue bsonValue = doc.get(fieldName);
    // If `bsonValue` is null, then there wasn't an entry for that field
    // so we want to use zero as the default.
    if (bsonValue == null) {
      return 0;
    } else {
      return bsonValue.asDouble().intValue();
    }
  }

}
