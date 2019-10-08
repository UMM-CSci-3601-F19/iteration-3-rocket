package umm3601.user;

import com.mongodb.MongoException;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MapReduceIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.BsonDocument;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.Iterator;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.mongodb.client.model.Filters.eq;

/**
 * Controller that manages requests for info about users.
 */
public class UserController {

  private final MongoCollection<Document> userCollection;

  /**
   * Construct a controller for users.
   *
   * @param database the database containing user data
   */
  public UserController(MongoDatabase database) {
    userCollection = database.getCollection("users");
  }

  /**
   * Helper method that gets a single user specified by the `id`
   * parameter in the request.
   *
   * @param id the Mongo ID of the desired user
   * @return the desired user as a JSON object if the user with that ID is found,
   * and `null` if no user with that ID is found
   */
  public String getUser(String id) {
    FindIterable<Document> jsonUsers
      = userCollection
      .find(eq("_id", new ObjectId(id)));

    Iterator<Document> iterator = jsonUsers.iterator();
    if (iterator.hasNext()) {
      Document user = iterator.next();
      return user.toJson();
    } else {
      // We didn't find the desired user
      return null;
    }
  }

  /**
   * Helper method which iterates through the collection, receiving all
   * documents if no query parameter is specified. If the age query parameter
   * is specified, then the collection is filtered so only documents of that
   * specified age are found.
   *
   * @param queryParams the query parameters provided in the URL of this request
   * @return an array of Users in a JSON formatted string
   */
  public String getUsers(Map<String, String[]> queryParams) {

    Document filterDoc = new Document();

    if (queryParams.containsKey("age")) {
      int targetAge = Integer.parseInt(queryParams.get("age")[0]);
      filterDoc = filterDoc.append("age", targetAge);
    }

    if (queryParams.containsKey("company")) {
      String targetContent = (queryParams.get("company")[0]);
      Document contentRegQuery = new Document();
      contentRegQuery.append("$regex", targetContent);
      contentRegQuery.append("$options", "i");
      filterDoc = filterDoc.append("company", contentRegQuery);
    }

    //FindIterable comes from mongo, Document comes from Gson
    FindIterable<Document> matchingUsers = userCollection.find(filterDoc);

    return serializeIterable(matchingUsers);
  }

  /*
   * Take an iterable collection of documents, turn each into JSON string
   * using `document.toJson`, and then join those strings into a single
   * string representing an array of JSON objects.
   *
   * Got this nifty trick for turning our iterator into a JSON array from
   * https://stackoverflow.com/a/52198430
   */
  private String serializeIterable(Iterable<Document> documents) {
    return StreamSupport.stream(documents.spliterator(), false)
      .map(Document::toJson)
      .collect(Collectors.joining(", ", "[", "]"));
  }

  public String getUserSummary() {

    String mapFunction
      = "function() { \n" +
      "    emit({ company: this.company, \n" +
      "           ageBracket: (this.age<30?\"under30\":((this.age<=55)?\"between30and55\":\"over55\")) }, \n" +
      "         1); \n" +
      "}";
    String reduceFunction = "function(k, vs) { return Array.sum(vs) }";

    MapReduceIterable<Document> mapReduceResults = userCollection.mapReduce(mapFunction, reduceFunction);

    return buildUserSummaryResult(mapReduceResults);
  }

  private String buildUserSummaryResult(MapReduceIterable<Document> mapReduceResults) {
    UserSummaryResult result = new UserSummaryResult();

    for (Document entry : mapReduceResults) {
      result.addEntry(entry);
    }

    BsonDocument resultDocument = result.getFinalDocument();

    return resultDocument.toJson();
  }

  /**
   * Helper method which appends received user information to the to-be added document
   *
   * @param name    the name of this user
   * @param age     the user's age
   * @param company the company the user works for
   * @param email   the user's email
   * @return boolean after successfully or unsuccessfully adding a user
   */
  public String addNewUser(String name, int age, String company, String email) {

    Document newUser = new Document();
    newUser.append("name", name);
    newUser.append("age", age);
    newUser.append("company", company);
    newUser.append("email", email);

    try {
      userCollection.insertOne(newUser);
      ObjectId id = newUser.getObjectId("_id");
      System.err.println("Successfully added new user [_id=" + id + ", name=" + name + ", age=" + age + " company=" + company + " email=" + email + ']');
      return id.toHexString();
    } catch (MongoException me) {
      me.printStackTrace();
      return null;
    }
  }
}
