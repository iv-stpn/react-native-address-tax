import { AppRegistry } from "react-native";
import { App } from "./App";

// react-native-web renders through AppRegistry so its StyleSheet registry
// injects the generated CSS into the document head.
AppRegistry.registerComponent("AddressTaxDemo", () => App);
AppRegistry.runApplication("AddressTaxDemo", {
  rootTag: document.getElementById("root"),
});
