// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LendingPlatform {
    struct Loan {
        address borrower;
        address lender;
        uint256 amount;
        uint256 interest;
        uint256 dueDate;
        bool funded;
        bool repaid;
    }

    uint256 public loanCount;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256) public reputation;

    event LoanRequested(uint256 loanId, address borrower, uint256 amount, uint256 interest);
    event LoanFunded(uint256 loanId, address lender);
    event LoanRepaid(uint256 loanId, address borrower);

    function requestLoan(uint256 amount, uint256 interest, uint256 duration) external {
        loanCount++;
        loans[loanCount] = Loan(msg.sender, address(0), amount, interest, block.timestamp + duration, false, false);
        userLoans[msg.sender].push(loanCount);
        emit LoanRequested(loanCount, msg.sender, amount, interest);
    }

    function fundLoan(uint256 loanId) external payable {
        Loan storage ln = loans[loanId];
        require(!ln.funded && !ln.repaid, "Loan not fundable");
        require(msg.value == ln.amount, "Send full loan amount");
        ln.lender = msg.sender;
        ln.funded = true;
        payable(ln.borrower).transfer(ln.amount);
        emit LoanFunded(loanId, msg.sender);
    }

    function repayLoan(uint256 loanId) external payable {
        Loan storage ln = loans[loanId];
        require(ln.funded && !ln.repaid, "Loan not active");
        require(msg.sender == ln.borrower, "Only borrower");
        require(msg.value == ln.amount + ln.interest, "Pay total amount + interest");
        ln.repaid = true;
        payable(ln.lender).transfer(msg.value);
        reputation[msg.sender]++;
        emit LoanRepaid(loanId, msg.sender);
    }

    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }
    // Return all loan IDs
function getAllLoanIds() external view returns (uint256[] memory) {
    uint256[] memory ids = new uint256[](loanCount);
    for (uint256 i = 0; i < loanCount; i++) {
        ids[i] = i + 1; // Loan IDs start at 1
    }
    return ids;
    }
// Return reputation of a user
function getReputation(address user) external view returns (uint256) {
    return reputation[user];
   }
}
