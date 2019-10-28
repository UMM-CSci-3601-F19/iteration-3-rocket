package umm3601.history;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bson.types.ObjectId;
import spark.Request;
import spark.Response;

public class HistoryRequestHandler {
  private final HistoryController historyController;

  public HistoryRequestHandler(HistoryController historyController) {this.historyController = historyController;}


  public JsonObject getHistory(Request request, Response response) {

    return null;
  }
}
