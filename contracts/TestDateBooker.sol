pragma solidity ^0.5.0;


import './DateBooker.sol';

/**
 * Contract whose sole purpose is to test DateBooker library,
 * it exposes all of DateBooker's public functions and returns their results
 */
contract TestDateBooker {

  // Setup DateBooker library
  using DateBooker for DateBooker.BookerStorage;
  DateBooker.BookerStorage dateBooker;

  function register(uint capacity) public returns (uint) {
    return dateBooker.register(capacity);
  }

  function book(uint id, uint fromDate, uint nbOfDays) public returns (int) {
    return dateBooker.book(id, fromDate, nbOfDays);
  }

  function cancel(uint id, uint bid) public returns (int) {
    return dateBooker.cancel(id, bid);
  }

  function findBook(uint id, uint bid) public view returns (int) {
    return dateBooker.findBook(id, bid);
  }

  function getActiveBookingsCount(uint id) public view returns (uint count) {
    return dateBooker.getActiveBookingsCount(id);
  }

  function getSize(uint id) view public returns (uint) {
    return dateBooker.getSize(id);
  }

  function getCapacity(uint id) view public returns (uint) {
     return dateBooker.getCapacity(id);
  }

  function isEmpty(uint id) view public returns (bool) {
     return dateBooker.isEmpty(id);
  }

  function hasSpace(uint id) view public returns (bool) {
     return dateBooker.hasSpace(id);
  }

  function getDates(uint id, uint bid) public view returns (uint fromDate, uint toDate) {
     return dateBooker.getDates(id, bid);
  }
}