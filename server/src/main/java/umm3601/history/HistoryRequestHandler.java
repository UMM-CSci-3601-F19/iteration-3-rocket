package umm3601.history;

import com.google.gson.JsonParser;
import spark.Request;
import spark.Response;

public class HistoryRequestHandler {
  private final HistoryController historyController;

  public HistoryRequestHandler(HistoryController historyController) {this.historyController = historyController;}

  public Object getHistory(Request request, Response response) {
    response.type("application/json");
    String room = request.params("room");
    String history = historyController.getHistory(room);
    if (history != null) {
      return new JsonParser().parse(history);
    } else {
      response.status(404);
      response.body("The requested room with id " + room + " was not found");
      return "";
    }
  }
}
