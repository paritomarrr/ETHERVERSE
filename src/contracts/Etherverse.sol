// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0;

contract Etherverse {
    string public name = "Etherverse";

    uint256 public imageCount = 0;
    // Store images

    struct Image {
        uint256 id;
        string hashValue;
        string description;
        uint256 tipAmount;
        address payable author;
    }

    event ImageTipped(
        uint256 id,
        string hashValue,
        string description,
        uint256 tipAmount,
        address payable author
    );
    event createImage(
        uint256 id,
        string hashValue,
        string description,
        uint256 tipAmount,
        address payable author
    );

    mapping(uint256 => Image) public images;

    // Create images
    function uploadImage(string memory _hashValue, string memory _description)
        public
    {
        require(bytes(_hashValue).length > 0);

        require(bytes(_description).length > 0);
        require(msg.sender != address(0x0));

        // increment image id
        imageCount++;

        // add image to contract
        images[imageCount] = Image(
            imageCount,
            _hashValue,
            _description,
            0,
            msg.sender
        );

        // Trigger an event
        emit createImage(imageCount, _hashValue, _description, 0, msg.sender);
    }

    // Tip images
    function tipImageOwner(uint256 _id) public payable {
        // make sure id is valid
        require(_id > 0 && _id <= imageCount);
        // fetch the image
        Image memory _image = images[_id];
        // fetch author
        address payable _author = _image.author;
        // Pay the author by sending them ether
        address(_author).transfer(msg.value);
        // increment the tip amount
        _image.tipAmount = _image.tipAmount + msg.value;
        // update the image
        images[_id] = _image;
        // trigger an event
        emit ImageTipped(
            _id,
            _image.hashValue,
            _image.description,
            _image.tipAmount,
            _author
        );
    }
}
