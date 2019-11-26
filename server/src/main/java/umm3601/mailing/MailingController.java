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

  private final String EMAIL_FROM = "laundry@service.morrisfacility.com";

  public final MongoCollection<Document> subscriptionCollection;
  private final MongoCollection<Document> machineCollection;

  public MailingController(MongoDatabase subscriptionDatabase, MongoDatabase machineDatabase) {
    this.subscriptionCollection = subscriptionDatabase.getCollection("subscriptions");
    this.machineCollection = machineDatabase.getCollection("machines");
  }

  public void checkSubscriptions() throws IOException {
    System.out.println("[update] INFO mailing.MailingController - Checking machine and room subscriptions");
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
    System.out.println("[update] INFO mailing.MailingController - Checked machine and room subscriptions");
  }

  private void sendMachineNotification(String email, String roomName, String machineName, String type) throws IOException {
    String subject = "Status change of the " + type + "you subscribed";
    Content content = new Content("text/html", "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\"><html data-editor-version=\"2\" class=\"sg-campaigns\" xmlns=\"http://www.w3.org/1999/xhtml\"><head>\n" +
      "      <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n" +
      "      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1\">\n" +
      "      <!--[if !mso]><!-->\n" +
      "      <meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\">\n" +
      "      <!--<![endif]-->\n" +
      "      <!--[if (gte mso 9)|(IE)]>\n" +
      "      <xml>\n" +
      "        <o:OfficeDocumentSettings>\n" +
      "          <o:AllowPNG/>\n" +
      "          <o:PixelsPerInch>96</o:PixelsPerInch>\n" +
      "        </o:OfficeDocumentSettings>\n" +
      "      </xml>\n" +
      "      <![endif]-->\n" +
      "      <!--[if (gte mso 9)|(IE)]>\n" +
      "  <style type=\"text/css\">\n" +
      "    body {width: 600px;margin: 0 auto;}\n" +
      "    table {border-collapse: collapse;}\n" +
      "    table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}\n" +
      "    img {-ms-interpolation-mode: bicubic;}\n" +
      "  </style>\n" +
      "<![endif]-->\n" +
      "      <style type=\"text/css\">\n" +
      "    body, p, div {\n" +
      "      font-family: verdana,geneva,sans-serif;\n" +
      "      font-size: 16px;\n" +
      "    }\n" +
      "    body {\n" +
      "      color: #516775;\n" +
      "    }\n" +
      "    body a {\n" +
      "      color: #993300;\n" +
      "      text-decoration: none;\n" +
      "    }\n" +
      "    p { margin: 0; padding: 0; }\n" +
      "    table.wrapper {\n" +
      "      width:100% !important;\n" +
      "      table-layout: fixed;\n" +
      "      -webkit-font-smoothing: antialiased;\n" +
      "      -webkit-text-size-adjust: 100%;\n" +
      "      -moz-text-size-adjust: 100%;\n" +
      "      -ms-text-size-adjust: 100%;\n" +
      "    }\n" +
      "    img.max-width {\n" +
      "      max-width: 100% !important;\n" +
      "    }\n" +
      "    .column.of-2 {\n" +
      "      width: 50%;\n" +
      "    }\n" +
      "    .column.of-3 {\n" +
      "      width: 33.333%;\n" +
      "    }\n" +
      "    .column.of-4 {\n" +
      "      width: 25%;\n" +
      "    }\n" +
      "    @media screen and (max-width:480px) {\n" +
      "      .preheader .rightColumnContent,\n" +
      "      .footer .rightColumnContent {\n" +
      "        text-align: left !important;\n" +
      "      }\n" +
      "      .preheader .rightColumnContent div,\n" +
      "      .preheader .rightColumnContent span,\n" +
      "      .footer .rightColumnContent div,\n" +
      "      .footer .rightColumnContent span {\n" +
      "        text-align: left !important;\n" +
      "      }\n" +
      "      .preheader .rightColumnContent,\n" +
      "      .preheader .leftColumnContent {\n" +
      "        font-size: 80% !important;\n" +
      "        padding: 5px 0;\n" +
      "      }\n" +
      "      table.wrapper-mobile {\n" +
      "        width: 100% !important;\n" +
      "        table-layout: fixed;\n" +
      "      }\n" +
      "      img.max-width {\n" +
      "        height: auto !important;\n" +
      "        max-width: 100% !important;\n" +
      "      }\n" +
      "      a.bulletproof-button {\n" +
      "        display: block !important;\n" +
      "        width: auto !important;\n" +
      "        font-size: 80%;\n" +
      "        padding-left: 0 !important;\n" +
      "        padding-right: 0 !important;\n" +
      "      }\n" +
      "      .columns {\n" +
      "        width: 100% !important;\n" +
      "      }\n" +
      "      .column {\n" +
      "        display: block !important;\n" +
      "        width: 100% !important;\n" +
      "        padding-left: 0 !important;\n" +
      "        padding-right: 0 !important;\n" +
      "        margin-left: 0 !important;\n" +
      "        margin-right: 0 !important;\n" +
      "      }\n" +
      "    }\n" +
      "  </style>\n" +
      "      <!--user entered Head Start-->\n" +
      "\n" +
      "     <!--End Head user entered-->\n" +
      "    </head>\n" +
      "    <body>\n" +
      "      <center class=\"wrapper\" data-link-color=\"#993300\" data-body-style=\"font-size:16px; font-family:verdana,geneva,sans-serif; color:#516775; background-color:#F9F5F2;\">\n" +
      "        <div class=\"webkit\">\n" +
      "          <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" class=\"wrapper\" bgcolor=\"#F9F5F2\">\n" +
      "            <tbody><tr>\n" +
      "              <td valign=\"top\" bgcolor=\"#F9F5F2\" width=\"100%\">\n" +
      "                <table width=\"100%\" role=\"content-container\" class=\"outer\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
      "                  <tbody><tr>\n" +
      "                    <td width=\"100%\">\n" +
      "                      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
      "                        <tbody><tr>\n" +
      "                          <td>\n" +
      "                            <!--[if mso]>\n" +
      "    <center>\n" +
      "    <table><tr><td width=\"600\">\n" +
      "  <![endif]-->\n" +
      "                                    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:100%; max-width:600px;\" align=\"center\">\n" +
      "                                      <tbody><tr>\n" +
      "                                        <td role=\"modules-container\" style=\"padding:0px 0px 0px 0px; color:#516775; text-align:left;\" bgcolor=\"#F9F5F2\" width=\"100%\" align=\"left\"><table class=\"module preheader preheader-hide\" role=\"module\" data-type=\"preheader\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;\">\n" +
      "    <tbody><tr>\n" +
      "      <td role=\"module-content\">\n" +
      "        <p></p>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      "  </tbody></table><table class=\"module\" role=\"module\" data-type=\"text\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"8VquPM2ZMj7RJRhAUE6wmF\" data-mc-module-version=\"2019-10-22\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"background-color:#ffffff; padding:50px 0px 10px 0px; line-height:30px; text-align:inherit;\" height=\"100%\" valign=\"top\" bgcolor=\"#ffffff\"><div><div style=\"font-family: inherit; text-align: center\"><span style=\"color: #7a0019; font-size: 28px; font-family: georgia,serif\"><strong>Your Subscribed Machine&nbsp;</strong></span></div>\n" +
      "<div style=\"font-family: inherit; text-align: center\"><span style=\"color: #7a0019; font-size: 28px; font-family: georgia,serif\"><strong>is Available!</strong></span></div>\n" +
      "<div style=\"font-family: inherit; text-align: center\"><br></div><div></div></div></td>\n" +
      "      </tr>\n" +
      "    </tbody></table><table class=\"wrapper\" role=\"module\" data-type=\"image\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"eUYR8ZuwyTirQCAuyEc98X\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"font-size:6px; line-height:10px; padding:0px 0px 0px 0px;\" valign=\"top\" align=\"center\"><img class=\"max-width\" border=\"0\" style=\"display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;\" src=\"https://www.baylinen.com.au/wp-content/uploads/2018/04/shutterstock_190403720-1024x786.jpg\" alt=\"Laundry Facilities\" width=\"600\" data-responsive=\"true\" data-proportionally-constrained=\"false\"></td>\n" +
      "      </tr>\n" +
      "    </tbody></table><table class=\"module\" role=\"module\" data-type=\"text\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"8VquPM2ZMj7RJRhAUE6wmF.1\" data-mc-module-version=\"2019-10-22\">\n" +
      "    <tbody>\n" +
      "      <tr>\n" +
      "        <td style=\"padding:50px 0px 10px 0px; line-height:30px; text-align:inherit; background-color:#ffffff;\" height=\"100%\" valign=\"top\" bgcolor=\"#ffffff\" role=\"module-content\"><div><div style=\"font-family: inherit; text-align: center\"><span style=\"color: #7a0019; font-size: 32px; font-family: georgia,serif\"><strong>" + machineName + "</strong></span></div><div></div></div></td>\n" +
      "      </tr>\n" +
      "    </tbody>\n" +
      "  </table><table class=\"module\" role=\"module\" data-type=\"text\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"keQHYG1b1ztewxwhDtuCpS\" data-mc-module-version=\"2019-10-22\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"background-color:#ffffff; padding:10px 40px 20px 40px; line-height:22px; text-align:inherit;\" height=\"100%\" valign=\"top\" bgcolor=\"#ffffff\"><div><div style=\"font-family: inherit; text-align: center\"><span style=\"color: #81686d; font-size: 18px; font-family: verdana,geneva,sans-serif\">available machines usually run out fast</span></div>\n" +
      "<div style=\"font-family: inherit; text-align: center\"><br></div>\n" +
      "<ul>\n" +
      "  <li style=\"text-align: inherit\"><span style=\"color: #81686d; font-family: verdana,geneva,sans-serif\">You received this notification because you have subscribed to our notification service.</span></li>\n" +
      "  <li style=\"text-align: inherit\"><span style=\"color: #81686d\">Use our web app to find the machine in your subscribed room.</span></li>\n" +
      "  <li style=\"text-align: inherit\"><span style=\"color: #81686d; font-family: verdana,geneva,sans-serif\">The notification is only sent once for each subscription.</span></li>\n" +
      "  <li style=\"text-align: inherit\"><span style=\"color: #81686d; font-family: verdana,geneva,sans-serif\">Please do not reply to this email.</span></li>\n" +
      "</ul><div></div></div></td>\n" +
      "      </tr>\n" +
      "    </tbody></table><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"module\" data-role=\"module-button\" data-type=\"button\" role=\"module\" style=\"table-layout:fixed\" width=\"100%\" data-muid=\"hthYAt191yTdg6FPWYKodF\"><tbody><tr><td align=\"center\" bgcolor=\"#ffffff\" class=\"outer-td\" style=\"padding:0px 0px 40px 0px; background-color:#ffffff;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"button-css__deep-table___2OZyb wrapper-mobile\" style=\"text-align:center\"><tbody><tr><td align=\"center\" bgcolor=\"#7A0019\" class=\"inner-td\" style=\"border-radius:6px; font-size:16px; text-align:center; background-color:inherit;\"><a style=\"background-color:#7A0019; border:1px solid #993300; border-color:#993300; border-radius:0px; border-width:1px; color:#ffffff; display:inline-block; font-family:verdana,geneva,sans-serif; font-size:16px; font-weight:normal; letter-spacing:1px; line-height:30px; padding:12px 20px 12px 20px; text-align:center; text-decoration:none; border-style:solid;\" href=\"http://206.189.163.212:4567/\" target=\"_blank\">Find This Machine</a></td></tr></tbody></table></td></tr></tbody></table><table class=\"module\" role=\"module\" data-type=\"spacer\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"h5Act64miE4yjzNnz1YMGs\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"padding:0px 0px 50px 0px;\" role=\"module-content\" bgcolor=\"\">\n" +
      "        </td>\n" +
      "      </tr>\n" +
      "    </tbody></table><table class=\"module\" role=\"module\" data-type=\"text\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"vh6t2nbGK2ApVEk1CB3r5A\" data-mc-module-version=\"2019-10-22\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"padding:18px 0px 18px 0px; line-height:30px; text-align:inherit;\" height=\"100%\" valign=\"top\" bgcolor=\"\"><div><div style=\"font-family: inherit; text-align: center\"><span style=\"color: #993300; font-size: 24px; font-family: georgia,serif\"><strong>Morris Laundry Facilities</strong></span></div><div></div></div></td>\n" +
      "      </tr>\n" +
      "    </tbody></table><div data-role=\"module-unsubscribe\" class=\"module unsubscribe-css__unsubscribe___2CDlR\" role=\"module\" data-type=\"unsubscribe\" style=\"color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:center;\" data-muid=\"mQ1u1Awkou7szvSGChCGcV\">\n" +
      "    <div class=\"Unsubscribe--addressLine\"><p class=\"Unsubscribe--senderName\" style=\"font-family:arial,helvetica,sans-serif; font-size:12px; line-height:20px;\">Morris Laundry Facilities</p><p style=\"font-family:arial,helvetica,sans-serif; font-size:12px; line-height:20px;\"><span class=\"Unsubscribe--senderAddress\">600 E 4th St.</span>, <span class=\"Unsubscribe--senderCity\">Morris</span>, <span class=\"Unsubscribe--senderState\">MN</span> <span class=\"Unsubscribe--senderZip\">56267-2132</span></p></div>\n" +
      "    <p style=\"font-family:arial,helvetica,sans-serif; font-size:12px; line-height:20px;\"><a class=\"Unsubscribe--unsubscribeLink\" href=\"{{{unsubscribe}}}\" style=\"\">Unsubscribe</a> - <a href=\"{{{unsubscribe_preferences}}}\" target=\"_blank\" class=\"Unsubscribe--unsubscribePreferences\" style=\"\">Unsubscribe Preferences</a></p></div><table class=\"module\" role=\"module\" data-type=\"spacer\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"eAq5DwvRYWV4D7T3oBCXhH\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"padding:0px 0px 30px 0px;\" role=\"module-content\" bgcolor=\"\">\n" +
      "        </td>\n" +
      "      </tr>\n" +
      "    </tbody></table></td>\n" +
      "                                      </tr>\n" +
      "                                    </tbody></table>\n" +
      "                                    <!--[if mso]>\n" +
      "                                  </td>\n" +
      "                                </tr>\n" +
      "                              </table>\n" +
      "                            </center>\n" +
      "                            <![endif]-->\n" +
      "                          </td>\n" +
      "                        </tr>\n" +
      "                      </tbody></table>\n" +
      "                    </td>\n" +
      "                  </tr>\n" +
      "                </tbody></table>\n" +
      "              </td>\n" +
      "            </tr>\n" +
      "          </tbody></table>\n" +
      "        </div>\n" +
      "      </center>\n" +
      "    \n" +
      "  \n" +
      "</body></html>");

    Mail mail = new Mail(new Email(EMAIL_FROM), subject, new Email(email), content);
    System.out.println("[subscribe] INFO mailing.MailingController - Sent notification to " + email + " status " + send(mail));
  }

  private void sendRoomNotification(String email, String roomName, String machineName, String type) throws IOException {
    String subject = "Status change of " + type + "s in " + roomName;
    Content content = new Content("text/html", "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\"><html data-editor-version=\"2\" class=\"sg-campaigns\" xmlns=\"http://www.w3.org/1999/xhtml\"><head>\n" +
      "      <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n" +
      "      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1\">\n" +
      "      <!--[if !mso]><!-->\n" +
      "      <meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\">\n" +
      "      <!--<![endif]-->\n" +
      "      <!--[if (gte mso 9)|(IE)]>\n" +
      "      <xml>\n" +
      "        <o:OfficeDocumentSettings>\n" +
      "          <o:AllowPNG/>\n" +
      "          <o:PixelsPerInch>96</o:PixelsPerInch>\n" +
      "        </o:OfficeDocumentSettings>\n" +
      "      </xml>\n" +
      "      <![endif]-->\n" +
      "      <!--[if (gte mso 9)|(IE)]>\n" +
      "  <style type=\"text/css\">\n" +
      "    body {width: 600px;margin: 0 auto;}\n" +
      "    table {border-collapse: collapse;}\n" +
      "    table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}\n" +
      "    img {-ms-interpolation-mode: bicubic;}\n" +
      "  </style>\n" +
      "<![endif]-->\n" +
      "      <style type=\"text/css\">\n" +
      "    body, p, div {\n" +
      "      font-family: verdana,geneva,sans-serif;\n" +
      "      font-size: 16px;\n" +
      "    }\n" +
      "    body {\n" +
      "      color: #516775;\n" +
      "    }\n" +
      "    body a {\n" +
      "      color: #993300;\n" +
      "      text-decoration: none;\n" +
      "    }\n" +
      "    p { margin: 0; padding: 0; }\n" +
      "    table.wrapper {\n" +
      "      width:100% !important;\n" +
      "      table-layout: fixed;\n" +
      "      -webkit-font-smoothing: antialiased;\n" +
      "      -webkit-text-size-adjust: 100%;\n" +
      "      -moz-text-size-adjust: 100%;\n" +
      "      -ms-text-size-adjust: 100%;\n" +
      "    }\n" +
      "    img.max-width {\n" +
      "      max-width: 100% !important;\n" +
      "    }\n" +
      "    .column.of-2 {\n" +
      "      width: 50%;\n" +
      "    }\n" +
      "    .column.of-3 {\n" +
      "      width: 33.333%;\n" +
      "    }\n" +
      "    .column.of-4 {\n" +
      "      width: 25%;\n" +
      "    }\n" +
      "    @media screen and (max-width:480px) {\n" +
      "      .preheader .rightColumnContent,\n" +
      "      .footer .rightColumnContent {\n" +
      "        text-align: left !important;\n" +
      "      }\n" +
      "      .preheader .rightColumnContent div,\n" +
      "      .preheader .rightColumnContent span,\n" +
      "      .footer .rightColumnContent div,\n" +
      "      .footer .rightColumnContent span {\n" +
      "        text-align: left !important;\n" +
      "      }\n" +
      "      .preheader .rightColumnContent,\n" +
      "      .preheader .leftColumnContent {\n" +
      "        font-size: 80% !important;\n" +
      "        padding: 5px 0;\n" +
      "      }\n" +
      "      table.wrapper-mobile {\n" +
      "        width: 100% !important;\n" +
      "        table-layout: fixed;\n" +
      "      }\n" +
      "      img.max-width {\n" +
      "        height: auto !important;\n" +
      "        max-width: 100% !important;\n" +
      "      }\n" +
      "      a.bulletproof-button {\n" +
      "        display: block !important;\n" +
      "        width: auto !important;\n" +
      "        font-size: 80%;\n" +
      "        padding-left: 0 !important;\n" +
      "        padding-right: 0 !important;\n" +
      "      }\n" +
      "      .columns {\n" +
      "        width: 100% !important;\n" +
      "      }\n" +
      "      .column {\n" +
      "        display: block !important;\n" +
      "        width: 100% !important;\n" +
      "        padding-left: 0 !important;\n" +
      "        padding-right: 0 !important;\n" +
      "        margin-left: 0 !important;\n" +
      "        margin-right: 0 !important;\n" +
      "      }\n" +
      "    }\n" +
      "  </style>\n" +
      "      <!--user entered Head Start-->\n" +
      "\n" +
      "     <!--End Head user entered-->\n" +
      "    </head>\n" +
      "    <body>\n" +
      "      <center class=\"wrapper\" data-link-color=\"#993300\" data-body-style=\"font-size:16px; font-family:verdana,geneva,sans-serif; color:#516775; background-color:#F9F5F2;\">\n" +
      "        <div class=\"webkit\">\n" +
      "          <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" class=\"wrapper\" bgcolor=\"#F9F5F2\">\n" +
      "            <tbody><tr>\n" +
      "              <td valign=\"top\" bgcolor=\"#F9F5F2\" width=\"100%\">\n" +
      "                <table width=\"100%\" role=\"content-container\" class=\"outer\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
      "                  <tbody><tr>\n" +
      "                    <td width=\"100%\">\n" +
      "                      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
      "                        <tbody><tr>\n" +
      "                          <td>\n" +
      "                            <!--[if mso]>\n" +
      "    <center>\n" +
      "    <table><tr><td width=\"600\">\n" +
      "  <![endif]-->\n" +
      "                                    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:100%; max-width:600px;\" align=\"center\">\n" +
      "                                      <tbody><tr>\n" +
      "                                        <td role=\"modules-container\" style=\"padding:0px 0px 0px 0px; color:#516775; text-align:left;\" bgcolor=\"#F9F5F2\" width=\"100%\" align=\"left\"><table class=\"module preheader preheader-hide\" role=\"module\" data-type=\"preheader\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;\">\n" +
      "    <tbody><tr>\n" +
      "      <td role=\"module-content\">\n" +
      "        <p></p>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      "  </tbody></table><table class=\"module\" role=\"module\" data-type=\"text\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"8VquPM2ZMj7RJRhAUE6wmF\" data-mc-module-version=\"2019-10-22\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"background-color:#ffffff; padding:50px 0px 10px 0px; line-height:30px; text-align:inherit;\" height=\"100%\" valign=\"top\" bgcolor=\"#ffffff\"><div><div style=\"font-family: inherit; text-align: center\"><span style=\"color: #7a0019; font-size: 28px; font-family: georgia,serif\"><strong>Your Subscribed Room&nbsp;</strong></span></div>\n" +
      "<div style=\"font-family: inherit; text-align: center\"><span style=\"color: #7a0019; font-size: 28px; font-family: georgia,serif\"><strong>is Available!</strong></span></div>\n" +
      "<div style=\"font-family: inherit; text-align: center\"><br></div><div></div></div></td>\n" +
      "      </tr>\n" +
      "    </tbody></table><table class=\"wrapper\" role=\"module\" data-type=\"image\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"eUYR8ZuwyTirQCAuyEc98X\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"font-size:6px; line-height:10px; padding:0px 0px 0px 0px;\" valign=\"top\" align=\"center\"><img class=\"max-width\" border=\"0\" style=\"display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;\" src=\"https://www.baylinen.com.au/wp-content/uploads/2018/04/shutterstock_190403720-1024x786.jpg\" alt=\"Laundry Facilities\" width=\"600\" data-responsive=\"true\" data-proportionally-constrained=\"false\"></td>\n" +
      "      </tr>\n" +
      "    </tbody></table><table class=\"module\" role=\"module\" data-type=\"text\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"8VquPM2ZMj7RJRhAUE6wmF.1\" data-mc-module-version=\"2019-10-22\">\n" +
      "    <tbody>\n" +
      "      <tr>\n" +
      "        <td style=\"padding:50px 0px 10px 0px; line-height:30px; text-align:inherit; background-color:#ffffff;\" height=\"100%\" valign=\"top\" bgcolor=\"#ffffff\" role=\"module-content\"><div><div style=\"font-family: inherit; text-align: center\"><span style=\"color: #7a0019; font-size: 32px; font-family: georgia,serif\"><strong>" + roomName + "</strong></span></div><div></div></div></td>\n" +
      "      </tr>\n" +
      "    </tbody>\n" +
      "  </table><table class=\"module\" role=\"module\" data-type=\"text\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"keQHYG1b1ztewxwhDtuCpS\" data-mc-module-version=\"2019-10-22\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"background-color:#ffffff; padding:10px 40px 20px 40px; line-height:22px; text-align:inherit;\" height=\"100%\" valign=\"top\" bgcolor=\"#ffffff\"><div><div style=\"font-family: inherit; text-align: center\"><span style=\"color: #81686d; font-size: 18px; font-family: verdana,geneva,sans-serif\">available machines usually run out fast</span></div>\n" +
      "<div style=\"font-family: inherit; text-align: center\"><br></div>\n" +
      "<ul>\n" +
      "  <li style=\"text-align: inherit\"><span style=\"color: #81686d; font-family: verdana,geneva,sans-serif\">You received this notification because you have subscribed to our notification service.</span></li>\n" +
      "  <li style=\"text-align: inherit\"><span style=\"color: #81686d\">Use our web app to find the machine in your subscribed room.</span></li>\n" +
      "  <li style=\"text-align: inherit\"><span style=\"color: #81686d; font-family: verdana,geneva,sans-serif\">The notification is only sent once for each subscription.</span></li>\n" +
      "  <li style=\"text-align: inherit\"><span style=\"color: #81686d; font-family: verdana,geneva,sans-serif\">Please do not reply to this email.</span></li>\n" +
      "</ul><div></div></div></td>\n" +
      "      </tr>\n" +
      "    </tbody></table><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"module\" data-role=\"module-button\" data-type=\"button\" role=\"module\" style=\"table-layout:fixed\" width=\"100%\" data-muid=\"hthYAt191yTdg6FPWYKodF\"><tbody><tr><td align=\"center\" bgcolor=\"#ffffff\" class=\"outer-td\" style=\"padding:0px 0px 40px 0px; background-color:#ffffff;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"button-css__deep-table___2OZyb wrapper-mobile\" style=\"text-align:center\"><tbody><tr><td align=\"center\" bgcolor=\"#7A0019\" class=\"inner-td\" style=\"border-radius:6px; font-size:16px; text-align:center; background-color:inherit;\"><a style=\"background-color:#7A0019; border:1px solid #993300; border-color:#993300; border-radius:0px; border-width:1px; color:#ffffff; display:inline-block; font-family:verdana,geneva,sans-serif; font-size:16px; font-weight:normal; letter-spacing:1px; line-height:30px; padding:12px 20px 12px 20px; text-align:center; text-decoration:none; border-style:solid;\" href=\"http://206.189.163.212:4567/\" target=\"_blank\">Find This Room</a></td></tr></tbody></table></td></tr></tbody></table><table class=\"module\" role=\"module\" data-type=\"spacer\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"noXVUxSTfKbdSVM2Xrua2t\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"padding:0px 0px 50px 0px;\" role=\"module-content\" bgcolor=\"\">\n" +
      "        </td>\n" +
      "      </tr>\n" +
      "    </tbody></table><table class=\"module\" role=\"module\" data-type=\"text\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"vh6t2nbGK2ApVEk1CB3r5A\" data-mc-module-version=\"2019-10-22\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"padding:18px 0px 18px 0px; line-height:30px; text-align:inherit;\" height=\"100%\" valign=\"top\" bgcolor=\"\"><div><div style=\"font-family: inherit; text-align: center\"><span style=\"color: #993300; font-size: 24px; font-family: georgia,serif\"><strong>Morris Laundry Facilities</strong></span></div><div></div></div></td>\n" +
      "      </tr>\n" +
      "    </tbody></table><div data-role=\"module-unsubscribe\" class=\"module unsubscribe-css__unsubscribe___2CDlR\" role=\"module\" data-type=\"unsubscribe\" style=\"color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:center;\" data-muid=\"mQ1u1Awkou7szvSGChCGcV\">\n" +
      "    <div class=\"Unsubscribe--addressLine\"><p class=\"Unsubscribe--senderName\" style=\"font-family:arial,helvetica,sans-serif; font-size:12px; line-height:20px;\">Morris Laundry Facilities</p><p style=\"font-family:arial,helvetica,sans-serif; font-size:12px; line-height:20px;\"><span class=\"Unsubscribe--senderAddress\">600 E 4th St.</span>, <span class=\"Unsubscribe--senderCity\">Morris</span>, <span class=\"Unsubscribe--senderState\">MN</span> <span class=\"Unsubscribe--senderZip\">56267-2132</span></p></div>\n" +
      "    <p style=\"font-family:arial,helvetica,sans-serif; font-size:12px; line-height:20px;\"><a class=\"Unsubscribe--unsubscribeLink\" href=\"{{{unsubscribe}}}\" style=\"\">Unsubscribe</a> - <a href=\"{{{unsubscribe_preferences}}}\" target=\"_blank\" class=\"Unsubscribe--unsubscribePreferences\" style=\"\">Unsubscribe Preferences</a></p></div><table class=\"module\" role=\"module\" data-type=\"spacer\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"eAq5DwvRYWV4D7T3oBCXhH\">\n" +
      "      <tbody><tr>\n" +
      "        <td style=\"padding:0px 0px 30px 0px;\" role=\"module-content\" bgcolor=\"\">\n" +
      "        </td>\n" +
      "      </tr>\n" +
      "    </tbody></table></td>\n" +
      "                                      </tr>\n" +
      "                                    </tbody></table>\n" +
      "                                    <!--[if mso]>\n" +
      "                                  </td>\n" +
      "                                </tr>\n" +
      "                              </table>\n" +
      "                            </center>\n" +
      "                            <![endif]-->\n" +
      "                          </td>\n" +
      "                        </tr>\n" +
      "                      </tbody></table>\n" +
      "                    </td>\n" +
      "                  </tr>\n" +
      "                </tbody></table>\n" +
      "              </td>\n" +
      "            </tr>\n" +
      "          </tbody></table>\n" +
      "        </div>\n" +
      "      </center>\n" +
      "    \n" +
      "  \n" +
      "</body></html>");

    Mail mail = new Mail(new Email(EMAIL_FROM), subject, new Email(email), content);
    System.out.println("[subscribe] INFO mailing.MailingController - Sent notification to " + email + " status " + send(mail));
  }

  private int send(Mail mail) throws IOException {
    final String key = "a_fake_key";
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
