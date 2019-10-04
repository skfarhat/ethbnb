pragma solidity ^0.5.0;


import './OptimBookerLib.sol';

/**
 * Contract whose sole purpose is to test OptimBookerLib,
 * it exposes all of LegacyBooker's public functions and returns their results
 */
contract TestLegacyBooker {

  // Setup LegacyBooker library
  using OptimBookerLib for OptimBookerLib.Storage;
  OptimBookerLib.Storage booker;

  function book(uint fromDate, uint nbOfDays) public returns (int) {
    return booker.book(fromDate, nbOfDays);
  }

  function cancel(uint bid) public returns (int) {
    return booker.cancel(bid);
  }

  function findBook(uint bid) public view returns (int) {
    return booker.find(bid);
  }

  function getDates(uint bid) public view returns (uint fromDate, uint toDate) {
     return booker.getDates(bid);
  }
}