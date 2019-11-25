package umm3601.mailing;

import com.google.gson.JsonParser;
import org.bson.Document;
import spark.Request;
import spark.Response;

public class MailingRequestHandler {

  private final MailingController mailingController;

  public MailingRequestHandler(MailingController mailingController) {this.mailingController = mailingController;}

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
