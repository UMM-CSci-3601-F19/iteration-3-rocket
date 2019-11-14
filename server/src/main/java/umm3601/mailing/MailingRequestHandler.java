package umm3601.mailing;

import com.google.gson.JsonParser;
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

  public Object subscribe(Request req, Response res) {
    res.type("string");





    return null;




  }




}
