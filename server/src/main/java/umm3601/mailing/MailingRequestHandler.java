package umm3601.mailing;

import com.google.gson.JsonParser;
import org.bson.Document;
import spark.Request;
import spark.Response;

public class MailingRequestHandler {

  private final MailingController mailingController;

  public MailingRequestHandler(MailingController mailingController) {this.mailingController = mailingController;}
//    public static void main (String[] args) {
//      Map<String, String> env = System.getenv();
//      for (String envName : env.keySet()) {
//        System.out.format("%s=%s%n",
//          envName,
//          env.get(envName));
//      }
//    }

  public String subscribe(Request req, Response res) {
    res.type("application/json");
    Document newSubscription = Document.parse(req.body());
    String email = newSubscription.getString("email");
    String type = newSubscription.getString("type");
    String id = newSubscription.getString("id");

    System.out.println("[subscribe] INFO mailing.MailingRequestHandler - Adding new subscription [email=" + email + ", type=" + type + ", id=" + id + ']');
    return mailingController.addNewSubscription(email, type, id);
  }
}
