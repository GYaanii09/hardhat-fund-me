const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

const sendValue = /* ethers.utils.parseEther("1");*/ "1000000000000000000"; ///1eth
developmentChains.includes(network.name)
  ? describe.skip
  : describe("Fundme", async function () {
      let fundMe, deployer;
      const sendValue = ethers.utils.parseEther("1");

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Allows to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), 0);
      });
    });
