import { User } from "./models/User";

const user = new User({ id: 1, name: "some nwe name", age: 0 });

user.on("save", () => {
  console.log(user);
});

user.save();
