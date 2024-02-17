**Data structure specs subject to change as action types are added**

# Action spec
```
{
  from: Public key of sender with no 0x,
  to: Public key of target (can be self) with no 0x,
  type: Type of action,
  payload: Payload dependent on type,
  timestamp: timestamp,
  address: { 
    lattitude:
    longitude:
    house_number:
    road:
    city:
    state:
    postcode:
    country:
  }
}
```

## Tag action spec
```
from: required,
to: required,
type: "tag",
payload: required (single hashtag with no #),
timestamp: required,
address: optional
  lattitude:
  longitude:
  house_number:
  road:
  city:
  state:
  postcode:
  country:
```

In this example, I am tagging myself with #cat. 
```
{
  from: "5795a56B46553913d53d34F7aE494a99E882209A",
  to: "5795a56B46553913d53d34F7aE494a99E882209A",
  type: "tag",
  payload: "cat",
  timestamp: "2024-02-17T03:30:50.221Z",
  address: { 
    lattitude:
    longitude:
    house_number:
    road:
    city:
    state:
    postcode:
    country:
  }
}
```
