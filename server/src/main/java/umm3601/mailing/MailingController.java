package umm3601.mailing;

// using SendGrid's Java Library
// https://github.com/sendgrid/sendgrid-java
import com.mongodb.MongoException;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.sendgrid.*;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.io.IOException;

public class MailingController {

  public final MongoCollection<Document> subscriptionCollection;
  private final MongoCollection<Document> machineCollection;

  public MailingController(MongoDatabase subscriptionDatabase, MongoDatabase machineDatabase) {
    this.subscriptionCollection = subscriptionDatabase.getCollection("subscriptions");
    this.machineCollection = machineDatabase.getCollection("machines");
  }

  public void checkSubscriptions() throws IOException {
    FindIterable<Document> subscriptions = subscriptionCollection.find();

    for (Document s : subscriptions) {
      Document filterDoc = new Document();
      filterDoc.append("room_id", s.get("room_id"));
      filterDoc.append("type", s.get("type"));
      filterDoc.append("status", "normal");
      filterDoc.append("running", false);
      Document vacantMachine = machineCollection.find(filterDoc).first();

      if (vacantMachine != null) {
        String machineName = transformId(vacantMachine.getString("name"));
        String roomName = transformId(vacantMachine.getString("room_id"));
        sendNotification(s.getString("email"), roomName, machineName);
        subscriptionCollection.deleteOne(s);
      }
    }
  }

  private void sendNotification(String email, String roomName, String machineName) throws IOException {
    Email from = new Email("test@example.com");
    Email to = new Email(email);
    String subject = "A vacant machine machine is found!";
    Content content = new Content("text/plain", "some content");
    Mail mail = new Mail(from, subject, to, content);

//    SendGrid sg = new SendGrid("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");
    SendGrid sg = new SendGrid("fake-key");
//    SendGrid sg = new SendGrid(System.getenv("SENDGRID_API_KEY"));
    Request request = new Request();
    request.setMethod(Method.POST);
    request.setEndpoint("mail/send");
    request.setBody(mail.build());
    Response response = sg.api(request);
    System.out.println("[subscribe] INFO mailing.MailingController - Sent notification to " + email + " with code " + response.getStatusCode());
  }

  private String transformId(String str) {
    String transformed = "";
    for (int i = 0; i < str.length(); ++i) {
      if (str.charAt(i) != '-' && str.charAt(i) != '_') {
        transformed += str.charAt(i);
      } else {
        transformed += ' ';
      }
    }
    return transformed;
  }

  public String addNewSubscription(String email, String type, String room_id) {
    Document newSubscription = new Document();
    newSubscription.append("email", email);
    newSubscription.append("type", type);
    newSubscription.append("room_id", room_id);
    try {
      subscriptionCollection.insertOne(newSubscription);
      ObjectId id = newSubscription.getObjectId("_id");
      System.err.println("[subscribe] INFO mailing.MailingController - Successfully added new subscription [email=" + email + ", type=" + type + ", room_id=" + room_id + ']');
      return id.toHexString();
    } catch (MongoException me) {
      me.printStackTrace();
      return null;
    }
  }
}
