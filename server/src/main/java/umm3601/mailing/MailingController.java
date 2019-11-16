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

  private final MongoCollection<Document> subscriptionCollection;
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

  public void sendNotification(String email, String roomName, String machineName) throws IOException {
    Email from = new Email("test@example.com");
    Email to = new Email(email);
    String subject = "Sending with SendGrid is Fun";
    Content content = new Content("text/plain", "and easy to do anywhere, even with Java");
    Mail mail = new Mail(from, subject, to, content);

    SendGrid sg = new SendGrid(System.getenv("SENDGRID_API_KEY"));
    Request request = new Request();
    request.setMethod(Method.POST);
    request.setEndpoint("mail/sendNotification");
    request.setBody(mail.build());
    Response response = sg.api(request);
    System.out.println(response.getStatusCode());
    System.out.println(response.getBody());
    System.out.println(response.getHeaders());
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
      System.err.println("Successfully added new subscription [email=" + email + ", type=" + type + ", room_id=" + room_id + ']');
      return id.toHexString();
    } catch (MongoException me) {
      me.printStackTrace();
      return null;
    }
  }
}
