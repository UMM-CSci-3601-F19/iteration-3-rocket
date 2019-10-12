package umm3601.laundry;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import spark.Request;
import spark.Response;

public class LaundryRequestHandler {

  private final LaundryController laundryController;

  public LaundryRequestHandler(LaundryController laundryController) {this.laundryController = laundryController;}

  public Object getRooms(Request request, Response response) {
    response.type("application/json");
    return laundryController.getRooms();
  }

  public Object getMachines(Request request, Response response) {
    response.type("application/json");
    String room = request.params("room");
    if (room == null || room.equals("")) {
      return laundryController.getMachines();
    } else {
      return laundryController.getMachinesAtRoom(room);


    }
  }

  public Object getMachineStatus(Request request, Response response) {
    response.type("boolean");
    String id = request.params("machine_id");
    String machine;
//    try {
      machine = laundryController.getMachine(id);
//    } catch (IllegalArgumentException e) {
      // This is thrown if the ID doesn't have the appropriate
      // form for a Mongo Object ID.
      // https://docs.mongodb.com/manual/reference/method/ObjectId/
//      response.status(400);
//      response.body("The requested machine id " + id + " wasn't a legal Mongo Object ID.\n" +
//        "See 'https://docs.mongodb.com/manual/reference/method/ObjectId/' for more info.");
//      return "";
//    }
    if (machine != null) {
      JsonObject jsonMachine = (JsonObject) new JsonParser().parse(machine);
      return jsonMachine.get("running");
    } else {
      response.status(404);
      response.body("The requested machine with id " + id + " was not found");
      return "";
    }
  }
}
