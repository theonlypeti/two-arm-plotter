function positionWithArms(arms, target) {
    const anchorPoint = arms[0].startJoint;

    // Calculate target vector
    const dx = target.x - anchorPoint.x;
    const dy = target.y - anchorPoint.y;
    const targetDist = Math.sqrt(dx**2 + dy**2);

    const a = arms[0].length;
    const b = arms[1].length;

    // Law of cosines calculations
    const baseAngle = Math.atan2(dy, dx);

    if (targetDist > a + b) {
        // Fully extended
        arms[0].setAngle(baseAngle);
        arms[1].setAngle(baseAngle);
        return;
    }

    // Calculate angles
    const cosElbow = (a**2 + b**2 - targetDist*targetDist) / (2 * a * b);
    const elbowAngle = Math.acos(Math.min(Math.max(cosElbow, -1), 1));

    const cosInnerAngle = (a**2 + targetDist*targetDist - b**2) / (2 * a * targetDist);
    const innerAngle = Math.acos(Math.min(Math.max(cosInnerAngle, -1), 1));

    // Set the angles directly on the arms
    arms[0].setAngle(baseAngle + innerAngle);
    arms[1].setAngle(arms[0].getAngle() - (Math.PI - elbowAngle));
}