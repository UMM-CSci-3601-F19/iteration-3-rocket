package umm3601.mailing;

// using SendGrid's Java Library
// https://github.com/sendgrid/sendgrid-java

import com.mongodb.MongoException;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.sendgrid.*;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.io.IOException;

public class MailingController {

  private final String EMAIL_FROM = "laundry_service@morrisfacility.com";

  public final MongoCollection<Document> subscriptionCollection;
  private final MongoCollection<Document> machineCollection;

  public MailingController(MongoDatabase subscriptionDatabase, MongoDatabase machineDatabase) {
    this.subscriptionCollection = subscriptionDatabase.getCollection("subscriptions");
    this.machineCollection = machineDatabase.getCollection("machines");
  }

  public void checkSubscriptions() throws IOException {
    Document filterDoc = new Document();
    filterDoc.append("type", "machine");
    FindIterable<Document> subscriptionsForMachines = subscriptionCollection.find().filter(filterDoc);
    for (Document s : subscriptionsForMachines) {
      filterDoc = new Document();
      filterDoc.append("id", s.get("id"));

      Document vacantMachine = machineCollection.find(filterDoc).first();
      if (vacantMachine != null
        && !vacantMachine.getBoolean("running")
        && vacantMachine.getString("status").equals("normal")) {

        String machineName = transformId(vacantMachine.getString("name"));
        String roomName = transformId(vacantMachine.getString("room_id"));
        String type = vacantMachine.getString("type");
        subscriptionCollection.deleteOne(s);
        sendMachineNotification(s.getString("email"), roomName, machineName, type);
      }
    }

    FindIterable<Document> subscriptionsForRooms = subscriptionCollection.find(Filters.not(filterDoc));
    for (Document s : subscriptionsForRooms) {
      filterDoc = new Document();
      filterDoc.append("room_id", s.get("id"));
      filterDoc.append("type", s.get("type"));
      filterDoc.append("status", "normal");
      filterDoc.append("running", false);

      Document vacantMachine = machineCollection.find(filterDoc).first();
      if (vacantMachine != null) {

        String machineName = transformId(vacantMachine.getString("name"));
        String roomName = transformId(vacantMachine.getString("room_id"));
        String type = vacantMachine.getString("type");
        subscriptionCollection.deleteOne(s);
        sendRoomNotification(s.getString("email"), roomName, machineName, type);
      }
    }
  }

  private void sendMachineNotification(String email, String roomName, String machineName, String type) throws IOException {
    String subject = "Your subscribed " + type + " " + machineName + " in room " + roomName + " is vacant!";
    Content content = new Content("text/plain", "some content");

    Mail mail = new Mail(new Email(EMAIL_FROM), subject, new Email(email), content);
    System.out.println("[subscribe] INFO mailing.MailingController - Sent notification to " + email);
    send(mail);
  }

  private void sendRoomNotification(String email, String roomName, String machineName, String type) throws IOException {
    String subject = "A vacant " + type + " " + machineName + " is found in " + roomName + "!";
    Content content = new Content("text/plain", "some content");

    Mail mail = new Mail(new Email(EMAIL_FROM), subject, new Email(email), content);
    System.out.print("[subscribe] INFO mailing.MailingController - Sent notification to " + email + " status " + send(mail));
  }

  private int send(Mail mail) throws IOException {
    String key = "put_your_key_here";
//  String key = System.getenv("SENDGRID_API_KEY");
    SendGrid sg = new SendGrid(key);
    Request request = new Request();
    request.setMethod(Method.POST);
    request.setEndpoint("mail/send");
    request.setBody(mail.build());
    Response response = sg.api(request);
    return response.getStatusCode();
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

  public String addNewSubscription(String email, String type, String id) {
    Document newSubscription = new Document();
    newSubscription.append("email", email);
    newSubscription.append("type", type);
    newSubscription.append("id", id);
    try {
      subscriptionCollection.insertOne(newSubscription);
      ObjectId _id = newSubscription.getObjectId("_id");
      System.err.println("[subscribe] INFO mailing.MailingController - Successfully added new subscription [email=" + email + ", type=" + type + ", id=" + id + ']');
      return _id.toHexString();
    } catch (MongoException e) {
      e.printStackTrace();
      return null;
    }
  }
}
