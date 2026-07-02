// ReactotronConfig.js
import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";
import {
  QueryClientManager,
  reactotronReactQuery,
} from "reactotron-react-query";
import { queryClient } from "./queryClient";

const queryClientManager = new QueryClientManager({ queryClient });

const reactotron = Reactotron.configure({ name: "Commerce App" })
  .useReactNative()
  .use(reactotronRedux())
  .use(reactotronReactQuery(queryClientManager))
  .connect();

export default reactotron;
