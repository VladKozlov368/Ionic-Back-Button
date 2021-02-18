package pro.inmost.ionic.back.button;

import android.util.Log;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * This class echoes a string called from JavaScript.
 */
public class CordovaPluginBackButton extends CordovaPlugin {

    public static List<CallbackContext> onBackListener = new ArrayList<>();

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if ("initBackButton".equals(action)) {
            this.initBackButton(callbackContext);
            return true;
        }
        return false;
    }

    private void initBackButton(CallbackContext callbackContext) {
      CordovaPluginBackButton.onBackListener.add(callbackContext);
    }
}
