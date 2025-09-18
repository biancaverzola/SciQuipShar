// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EquipmentBooking {
    enum BookingStatus { Requested, Confirmed }

    struct Equipment {
        string name;
        address payable owner;
        bool exists;
        uint pricePerDay;
    }

    struct Booking {
        uint id;
        string equipmentId;
        string userId;
        address user;
        BookingStatus status;
        bool userConfirmed;
        bool ownerConfirmed;
        uint bookingTimestamp;
        uint startTimestamp;
        uint endTimestamp;
    }

    mapping(string => Equipment) public equipments;
    mapping(uint => Booking) public bookings;
    mapping(uint => uint) public payments; // valor de cada reserva

    uint public bookingCounter;

    event EquipmentAdded(string equipmentId, string name, address owner);
    event BookingRequested(uint id, string equipmentId, string userId, uint amount);
    event BookingConfirmed(uint id, address paidTo, uint amount);

    function addEquipment(
        string memory _equipmentId,
        string memory _name,
        uint _pricePerDay
    ) public {
        require(!equipments[_equipmentId].exists, "Equipment already exists");
        equipments[_equipmentId] = Equipment({
            name: _name,
            owner: payable(msg.sender),
            exists: true,
            pricePerDay: _pricePerDay
        });
        emit EquipmentAdded(_equipmentId, _name, msg.sender);
    }

    function requestBooking(
        string memory _equipmentId,
        string memory _userId,
        uint _startTimestamp,
        uint _endTimestamp
    ) public payable {
        require(equipments[_equipmentId].exists, "Equipment not found");
        require(_startTimestamp < _endTimestamp, "Invalid time range");

        // Verificar conflitos de horário com reservas existentes
        for (uint i = 0; i < bookingCounter; i++) {
            Booking storage existing = bookings[i];
            if (
                keccak256(bytes(existing.equipmentId)) == keccak256(bytes(_equipmentId)) &&
                (
                    (_startTimestamp < existing.endTimestamp) &&
                    (_endTimestamp > existing.startTimestamp)
                )
            ) {
                revert("Equipment is already booked for the selected time range");
            }
        }

        Equipment storage equipment = equipments[_equipmentId];

        // Calcular valor total da reserva
        uint durationInDays = (_endTimestamp - _startTimestamp) / 1 days;
        require(durationInDays > 0, "Booking must be at least 1 day");
        uint expectedAmount = durationInDays * equipment.pricePerDay;
        require(msg.value >= expectedAmount, "Insufficient payment for booking duration");

        bookings[bookingCounter] = Booking({
            id: bookingCounter,
            equipmentId: _equipmentId,
            userId: _userId,
            user: msg.sender,
            status: BookingStatus.Requested,
            userConfirmed: false,
            ownerConfirmed: false,
            bookingTimestamp: block.timestamp,
            startTimestamp: _startTimestamp,
            endTimestamp: _endTimestamp
        });

        payments[bookingCounter] = msg.value;

        emit BookingRequested(bookingCounter, _equipmentId, _userId, msg.value);
        bookingCounter++;
    }

    function confirmBooking(uint _bookingId) public {
        require(_bookingId < bookingCounter, "Invalid booking ID");
        Booking storage b = bookings[_bookingId];
        require(b.status == BookingStatus.Requested, "Booking already confirmed");

        bool isUser = msg.sender == b.user;
        bool isOwner = msg.sender == equipments[b.equipmentId].owner;

        require(isUser || isOwner, "Only user or equipment owner can confirm");


        if (isUser && !b.userConfirmed) {
            b.userConfirmed = true;
        }

        if (isOwner && !b.ownerConfirmed) {
            b.ownerConfirmed = true;
        }

        if (b.userConfirmed && b.ownerConfirmed) {
            b.status = BookingStatus.Confirmed;
            uint amount = payments[_bookingId];
            payments[_bookingId] = 0;
            address payable receiver = equipments[b.equipmentId].owner;
            receiver.transfer(amount);
            emit BookingConfirmed(_bookingId, receiver, amount);
        }
    }
}
