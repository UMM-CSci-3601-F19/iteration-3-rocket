package umm3601.history;

import spark.Request;
import spark.Response;

public class HistoryRequestHandler {
  private final HistoryController historyController;

  public HistoryRequestHandler(HistoryController historyController) {this.historyController = historyController;}

  public Object getHistory(Request request, Response response) {
    response.type("application/json");
    return historyController.getHistory();
  }
}
