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
import java.lang.annotation.Documented;

public class MailingController {

  private final MongoCollection<Document> subscriptionCollection;
  private final MongoCollection<Document> machineCollection;

  public MailingController(MongoDatabase subscriptionDatabase, MongoDatabase machineDatabase) {
    this.subscriptionCollection = subscriptionDatabase.getCollection("subscriptions");
    this.machineCollection = machineDatabase.getCollection("machines");
  }

  public void send(String email, String room, String name) throws IOException {
    Email from = new Email("test@example.com");
    String subject = "Sending with SendGrid is Fun";
    Email to = new Email("test@example.com");
    Content content = new Content("text/plain", "and easy to do anywhere, even with Java");
    Mail mail = new Mail(from, subject, to, content);

    SendGrid sg = new SendGrid(System.getenv("SENDGRID_API_KEY"));
    Request request = new Request();
    try {
      request.setMethod(Method.POST);
      request.setEndpoint("mail/send");
      request.setBody(mail.build());
      Response response = sg.api(request);
      System.out.println(response.getStatusCode());
      System.out.println(response.getBody());
      System.out.println(response.getHeaders());
    } catch (IOException ex) {
      throw ex;
    }
  }

  public void sendNotifications() throws IOException {
    FindIterable<Document> subscriptions = subscriptionCollection.find();
    FindIterable<Document> machines = machineCollection.find();

    for (Document s : subscriptions) {
      Document filterDoc = new Document();
      filterDoc.append("room_id", s.get("room_id"));
      filterDoc.append("type", s.get("type"));
      filterDoc.append("status", "normal");
      filterDoc.append("running", false);
      Document vacantMachine = machineCollection.find(filterDoc).first();

      if (vacantMachine != null) {
        String name = vacantMachine.getString("name");
        String room = vacantMachine.getString("room_id");
        send(s.getString("email"), room, name);
        subscriptionCollection.deleteOne(s);
      }
    }
  }

  private String transformId(String str) {
    String transformed = "";
    for (int i = 0; i < str.length(); ++i) {
      if (str.charAt(i) != '-') {
        transformed += str.charAt(i);
      } else {
        transformed += ' ';
      }
    }

    while (str.indexOf('_') != -1) {
      str.replace('_', ' ');
    }
    return str;
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
