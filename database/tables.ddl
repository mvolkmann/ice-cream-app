create extension pgcrypto; -- needed to encrypt passwords

create table ice_creams (
  id serial primary key,
  flavor text
);

create table users (
  username text primary key,
  password text -- encrypted length
);

create table user_ice_creams (
  username text references users(username),
  ice_cream_id integer references ice_creams(id)
);
