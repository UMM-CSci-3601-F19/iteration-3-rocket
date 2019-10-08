package umm3601;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoDatabase;
import spark.Request;
import spark.Response;
import spark.Spark;
import umm3601.user.UserController;
import umm3601.user.UserRequestHandler;

import static spark.debug.DebugScreen.enableDebugScreen;

public class Server {
  private static final String DATABASE_NAME = "dev";
  private static final int SERVER_PORT = 4567;

  public static void main(String[] args) {
    configureSpark();
    defineRedirects();
    defineDemoRoutes();
    defineRoutes();
  }

  private static void configureSpark() {
    Spark.port(SERVER_PORT);
    enableDebugScreen();

    // Specify where assets like images will be "stored"
    Spark.staticFiles.location("/public");

    Spark.options("/*", (request, response) -> {
      String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
      if (accessControlRequestHeaders != null) {
        response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
      }

      String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
      if (accessControlRequestMethod != null) {
        response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
      }

      return "OK";
    });

    // Call before each request. This is necessary for the Angular code to be
    // able to make requests of the server.
    Spark.before((request, response)
      -> response.header("Access-Control-Allow-Origin", "*"));

    // Called after each request to insert the GZIP header into the response.
    // This causes the response to be compressed _if_ the client specified
    // in their request that they can accept compressed responses.
    // There's a similar "before" method that can be used to modify requests
    // before they they're processed by things like `get`.
    Spark.after("*", Server::addGzipHeader);
  }

  // Enable GZIP for all responses
  private static void addGzipHeader(Request request, Response response) {
    response.header("Content-Encoding", "gzip");
  }

  private static void defineRedirects() {
    Spark.redirect.get("", "/");
    // This redirects attempts to talk to the server without and `api/...` URL
    // back to Angular.
    Spark.redirect.get("/", "http://localhost:9000");
  }

  /*
   * These are just here as examples. Feel free to delete this method
   * and its routes as you build our your code.
   */
  private static void defineDemoRoutes() {
    // Simple example route
    Spark.get("/hello", (req, res) -> "Hello World");

    // An example of throwing an unhandled exception so you can see how the
    // Java Spark debugger displays errors like this. You want to remove
    // this from your code.
    Spark.get("api/error", (req, res) -> {
      throw new RuntimeException("A demonstration error");
    });
  }

  private static void defineRoutes() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase database = mongoClient.getDatabase(DATABASE_NAME);

    defineUserRoutes(database);

    // Handle "404" file not found requests:
    Spark.notFound((req, res) -> {
      res.type("text");
      res.status(404);
      return "Sorry, we couldn't find that!";
    });
  }

  private static void defineUserRoutes(MongoDatabase database) {
    UserController userController = new UserController(database);
    UserRequestHandler userRequestHandler = new UserRequestHandler(userController);

    Spark.get("api/users", userRequestHandler::getUsers);
    Spark.get("api/users/:id", userRequestHandler::getUserJSON);
    Spark.get("api/userSummary", userRequestHandler::getUserSummary);
    Spark.post("api/users/new", userRequestHandler::addNewUser);
  }
}
