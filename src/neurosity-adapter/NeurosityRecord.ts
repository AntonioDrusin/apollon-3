import {Field, Message, OneOf, Type} from "protobufjs";

@Type.d("PowerBandsRecord_v1")
export class PowerBandsRecord extends Message<PowerBandsRecord> {
    @Field.d(1, "float", "repeated")
    public gamma!: number[];
    @Field.d(2, "float", "repeated")
    public beta!: number[];
    @Field.d(3, "float", "repeated")
    public alpha!: number[];
    @Field.d(4, "float", "repeated")
    public theta!: number[];
    @Field.d(5, "float", "repeated")
    public delta!: number[];
}


@Type.d("NeurosityRecord_v1")
export class NeurosityRecord extends Message<NeurosityRecord> {
    @Field.d(1, "int64")
    public timestamp!: number;
    @OneOf.d("powerBands", "calm", "focus", "tag")
    public messageType!: "powerBands"| "calm"| "focus"| "tag";
    @Field.d(2, PowerBandsRecord)
    public powerBands?: PowerBandsRecord;
    @Field.d(3, "string")
    public tag?: string;
    @Field.d(4, "float")
    public focus?: number;
    @Field.d(5, "float")
    public calm?: number;
}

@Type.d("NeurosityFileVersionRecord_v1")
export class NeurosityFileVersionRecord extends Message<NeurosityFileVersionRecord> {
    @Field.d(1, "int32")
    public majorVersion!: number;
    @Field.d(2, "int32")
    public minorVersion!: number;
    @Field.d(3, "string")
    public identifier!: string;
}
