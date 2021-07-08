import { Callback } from "./Eventing";
import { AxiosPromise, AxiosResponse } from "axios";

interface ModelAttributes<T> {
  set(update: T): void;
  get<K extends keyof T>(key: K): T[K];
  getAll(): T;
}

interface Sync<T> {
  fetch(id: number): AxiosPromise;
  save(data: T): AxiosPromise;
}

interface Events {
  on(eventName: string, callback: Callback): void;
  trigger(eventName: string): void;
}

interface HasId {
  id?: number;
}

export class Model<T extends HasId> {
  constructor(
    private attributes: ModelAttributes<T>,
    private events: Events,
    private sync: Sync<T>
  ) {}

  // get on() {
  //   return this.events.on;
  // }
  // bottom shorter equivalent of getter
  // we can't use it when we assign a value in constructor (as it was in user before)
  // constructor(attrs: ModelAttributes) { this.attributes = attrs }
  // but can use with short syntax, as it now
  // constructor(public attributes:ModelAttributes){}
  on = this.events.on;
  trigger = this.events.trigger;
  get = this.attributes.get;

  set(update: T): void {
    this.attributes.set(update);
    this.events.trigger("change");
  }

  fetch(): void {
    const id = this.attributes.get("id");

    if (typeof id !== "number") {
      throw new Error("Cannot fetch without an id");
    }

    this.sync.fetch(id).then((response: AxiosResponse): void => {
      this.set(response.data);
    });
  }

  save(): void {
    this.sync
      .save(this.attributes.getAll())
      .then((_: AxiosResponse): void => {
        this.trigger("save");
      })
      .catch(() => {
        this.trigger("error");
      });
  }
}
