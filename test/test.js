const { assert } = require("chai");
const { default: Web3 } = require("web3");

const Etherverse = artifacts.require("./Etherverse.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Etherverse", ([deployer, author, tipper]) => {
  let etherverse;

  before(async () => {
    etherverse = await Etherverse.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await etherverse.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await etherverse.name();
      assert.equal(name, "Etherverse");
    });
  });
  describe("images", async () => {
    let result, imageCount;

    const hash = "abc123";

    before(async () => {
      result = await etherverse.uploadImage(hash, "Image description", {
        from: author,
      });
      imageCount = await etherverse.imageCount();
    });

    it("creates images", async () => {
      // success
      assert.equal(imageCount, 1);
      const event = result.logs[0].args;
      // console.log(result.logs[0].args.hashValue);
      assert.equal(event.id.toNumber(), imageCount.toNumber(), "id is correct");
      assert.equal(event.hashValue, hash, "hash is correct");
      assert.equal(
        event.description,
        "Image description",
        "description is correct"
      );
      assert.equal(event.tipAmount, "0", "tip amount is correct");
      assert.equal(event.author, author, " author is correct");

      await etherverse.uploadImage("hash", "", { from: author }).should.be
        .rejected;
    });
    //check from struct
    it("list images", async () => {
      const image = await etherverse.images(imageCount);
      assert.equal(image.id.toNumber(), imageCount.toNumber(), "id is correct");
      assert.equal(image.hashValue, hash, "hash is correct");
      assert.equal(
        image.description,
        "Image description",
        "description is correct"
      );
      assert.equal(image.tipAmount, "0", "tip amount is correct");
      assert.equal(image.author, author, " author is correct");
    });

    it("allows users o tip images", async () => {
      // track the author balance before purchase
      let oldAuthorBalance;
      oldAuthorBalance = await web3.eth.getBalance(author);
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);
      result = await etherverse.tipImageOwner(imageCount, {
        from: tipper,
        value: web3.utils.toWei("1", "Ether"),
      });
      // success
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), imageCount.toNumber(), "id is correct");
      assert.equal(event.hashValue, hash, "hash is correct");
      assert.equal(
        event.description,
        "Image description",
        "description is correct"
      );
      assert.equal(
        event.tipAmount,
        "1000000000000000000",
        "tip amount is correct"
      );
      assert.equal(event.author, author, "author is correct");

      // check that author recieved funds
      let newAuthorBalance;
      newAuthorBalance = await web3.eth.getBalance(author);
      newAuthorBalance = new web3.utils.BN(newAuthorBalance);

      let tipImageOwner;
      tipImageOwner = web3.utils.toWei("1", "Ether");
      tipImageOwner = new web3.utils.BN(tipImageOwner);

      const expectedBalance = oldAuthorBalance.add(tipImageOwner);
      assert.equal(newAuthorBalance.toString(), expectedBalance.toString());

      // Failure : tries to tip a image that does not exist
      await etherverse.tipImageOwner(99, {
        from: tipper,
        value: web3.utils.toWei("1", "Ether"),
      }).should.be.rejected;
    });
  });
});
