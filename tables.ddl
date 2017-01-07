create extension pgcrypto; -- needed to use gen_random_uuid()

drop table if exists ice_cream;
create table ice_cream (
  id serial primary key,
  flavor varchar(50)
);

drop table if exists users;
create table users (
  username varchar(50) primary key,
  password varchar(60) -- encrypted length
);
