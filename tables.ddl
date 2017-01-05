drop table if exists ice_cream;
create table ice_cream (
  id serial primary key,
  flavor varchar(50)
);

drop table if exists users;
create table users (
  id serial primary key,
  username varchar(50),
  password varchar(50)
);
