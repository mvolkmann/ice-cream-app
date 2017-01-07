create extension pgcrypto; -- needed to use gen_random_uuid()

create table ice_creams (
  id serial primary key,
  flavor varchar(50)
);

drop table if exists users;
create table users (
  username varchar(50) primary key,
  password varchar(60) -- encrypted length
);

drop table if exists ice_cream;
create table user_ice_creams (
  username varchar(50) references users (username),
  ice_cream_id integer references ice_cream (id)
);
