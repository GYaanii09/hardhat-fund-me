const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
//Defining the tests based on different functions
describe("FundMe", async () => {
  let fundMe, deployer, mockV3Aggregator;
  const sendValue = /* ethers.utils.parseEther("1");*/ "1000000000000000000"; ///1eth
  beforeEach(async () => {
    //deploy fundme using hardhat deploy
    await deployments.fixture(["all"]);
    deployer = (await getNamedAccounts()).deployer;
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  //test for the constructor
  describe("constructor", async () => {
    it("sets the aggregator address correctly ", async () => {
      const response = await fundMe.getPriceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  //Test for fund function
  !developmentChains.includes(network.name)
    ? describe.skip
    : describe("fund", async () => {
        it("Fails if not enough eth is sent", async () => {
          await expect(fundMe.fund()).to.be.revertedWith("Not enough ETH");
        });

        it("updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        /*it("Adds funder to array of getFunders", async () => {
      await fundMe.fund({ value: sendValue });
      const funder = fundMe.getFunders(0);
      assert.equal(deployer, funder);
    });*/
      });

  //test for withdraw function
  describe("withdraw", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it("withdraw ETH from a single founder", async () => {
      //Arrange
      //Act
      //ASsert

      //Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      //Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      //ASsert
      assert(endingFundMeBalance, 0);
      assert(
        startingDeployerBalance.add(startingFundMeBalance).toString(), //bignumber1.add(othervalue) ==> bignumber1 + othervalue
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("allows us to withdraw with multiple getFunders", async () => {
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectAccounts = await fundMe.connect(accounts[i]);
        await fundMeConnectAccounts.fund({ value: sendValue });
      }

      //Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      //Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      //ASsert
      assert(endingFundMeBalance, 0);
      assert(
        startingDeployerBalance.add(startingFundMeBalance).toString(), //bignumber1.add(othervalue) ==> bignumber1 + othervalue
        endingDeployerBalance.add(gasCost).toString()
      );

      //Make sure getFunders array is reset
      await expect(fundMe.getFunders(0)).to.be.reverted;

      for (let i = 1; i < 6; i++) {
        assert(await fundMe.getAddressToAmountFunded(accounts[i].address), 0);
      }
    });

    it("Only allows owner to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe_NotOwner");
    });
  });
});
