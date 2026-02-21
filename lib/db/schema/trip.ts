import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { driver } from "./auth";

export const logTypeEnum = pgEnum("vehicle_status", ["service", "trip"]);

export const log = pgTable("log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: logTypeEnum("type").notNull(),
  tripId: integer("trip_id").references(() => trip.id),
  serviceId: integer("service_id").references(() => trip.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const service = pgTable("service", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cost: integer("cost").notNull(),
  issue: text("issue").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const tripStatusEnum = pgEnum("trip_status", ["started", "completed", "cancelled"]);

export const trip = pgTable("trip", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  origin: text("start").notNull(),
  destination: text("end").notNull(),
  distance: integer("distance").notNull(),
  deadline: timestamp("deadline").notNull(),
  finishDate: timestamp("finish_date"),
  driverId: text("driver_id").references(() => driver.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicle.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const vehicleStatusEnum = pgEnum("vehicle_status", ["available", "trip", "maintenance", "retired"]);

export const vehicle = pgTable("vehicle", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  capacity: integer("capacity").notNull(),
  status: vehicleStatusEnum("status").default("available").notNull(),
  plate: text("plate").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});