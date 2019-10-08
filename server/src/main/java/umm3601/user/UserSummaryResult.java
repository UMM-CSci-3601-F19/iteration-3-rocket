package umm3601.user;

import org.bson.BsonDocument;
import org.bson.BsonDouble;
import org.bson.BsonValue;
import org.bson.Document;

public class UserSummaryResult {
  private BsonDocument companyMap = new BsonDocument();

  public void addEntry(Document entry) {
    String company = ((Document) entry.get("_id")).getString("company");
    String bracket = ((Document) entry.get("_id")).getString("ageBracket");
    int count = entry.getDouble("value").intValue();

    final BsonValue bsonValue = companyMap.get(company);
    BsonDocument companyEntry;
    if (bsonValue == null) {
      companyEntry = new BsonDocument();
    } else {
      companyEntry = bsonValue.asDocument();
    }
    companyEntry.put(bracket, new BsonDouble(count));
    companyMap.put(company, companyEntry);
  }

  public BsonDocument getFinalDocument() {
    return companyMap;
  }
}
