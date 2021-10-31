import { MarkupAnnotation, MarkupAnnotationObj } from './annotation_types';
import { CryptoInterface } from '../parser';
import { ErrorList, InvalidRectError, InvalidAnnotationTypeError, InvalidQuadPointError } from './annotation_errors';
import { WriterUtil } from '../writer-util';
import { AppStream, XObjectObj } from '../appearance-stream';
import { ContentStream } from '../content-stream';

export interface TextMarkupAnnotation extends MarkupAnnotation {
    quadPoints: number[] // specifies how the annotation goes arround the text
}

export class TextMarkupAnnotationObj extends MarkupAnnotationObj implements TextMarkupAnnotation {
    quadPoints: number[] = []

    public writeAnnotationObject(cryptoInterface : CryptoInterface) : number[] {
        let ret : number[] = super.writeAnnotationObject(cryptoInterface)

        ret = ret.concat(WriterUtil.QUADPOINTS)
        ret.push(WriterUtil.SPACE)
        ret = ret.concat(WriterUtil.writeNumberArray(this.quadPoints))
        ret.push(WriterUtil.SPACE)

        return ret
    }

    public validate(enact : boolean = true) : ErrorList {
        let errorList : ErrorList = super.validate(false)

        if (errorList.length === 1 && errorList[0] instanceof InvalidRectError) {
            if(this.quadPoints && this.quadPoints.length > 0) {
                this.rect = this.extractRectFromQuadPoints(this.quadPoints)
                errorList = this.checkRect(4, this.rect)
            }
        }

        if (!this.quadPoints || this.quadPoints.length === 0) {
            let rect = this.rect
            this.quadPoints = [rect[0], rect[3], rect[2], rect[3], rect[0], rect[1], rect[2], rect[1]]
        }


        errorList = errorList.concat(this.checkQuadPoints(this.quadPoints))

        if (enact) {
            for(let error of errorList) {
                throw error
            }
        }

        return errorList
    }

    /**
     * Extracts the rectangular hull from a quadPoint definition
     * */
    private extractRectFromQuadPoints(quadPoints: number[]): number[] {
        let x_values = quadPoints.filter((element, index) => index % 2 === 0)
        let y_values = quadPoints.filter((element, index) => index % 2 !== 0)

        return [Math.min(...x_values), Math.min(...y_values), Math.max(...x_values), Math.max(...y_values)]
    }

    /**
     * Checks the 'quadPoints' parameter
     * */
    private checkQuadPoints(quadPoints: number[]) : ErrorList {
        let errorList : ErrorList = []
        if (quadPoints.length % 8 !== 0)
            errorList.push(new InvalidQuadPointError(`Quadpoints array has length ${quadPoints.length} but must be a multiple of 8`))

        quadPoints.forEach((a) => {
            if ('number' !== typeof a)
                errorList.push(new InvalidQuadPointError("Quadpoint " + quadPoints + " has invalid entry: " + a))
        })

        return errorList
    }
}

export class HighlightAnnotationObj extends TextMarkupAnnotationObj {

    constructor() {
        super()
        this.type = "/Highlight"
        this.type_encoded = [47, 72, 105, 103, 104, 108, 105, 103, 104, 116] // = '/Highlight'
    }

    public createDefaultAppearanceStream() {
        this.appearanceStream = new AppStream(this)
        this.appearanceStream.new_object = true
        let xobj = new XObjectObj()
        xobj.object_id = this.factory.parser.getFreeObjectId()
        xobj.new_object = true
        xobj.bBox = [0, 0, 100, 100]
        xobj.matrix = [1, 0, 0, 1, 0, 0]
        let cs  = new ContentStream()
        xobj.contentStream = cs
        let cmo = cs.addMarkedContentObject(["/Tx"])
        let go = cmo.addGraphicObject()

        if (this.opacity !== 1) {
            go.addOperator("gs", ["/GParameters"])
        }

        if (this.quadPoints && this.quadPoints.length > 8) {
            go.setLineColor({r: 0, g: 0, b:0}).setFillColor(this.color)
            for(let i = 0; i < this.quadPoints.length; i+=8) {
                let points : number[] = []
                this.quadPoints.slice(i, i+8).forEach((value, index) => index % 2 === 0 ? points.push(value - this.rect[0]) : points.push(value - this.rect[1]))
                go.fillPolygon(points)
            }
        } else {
            go.setLineColor({r: 0, g: 0, b:0}).setFillColor(this.color).fillRect(0, 0, 100, 100, 25)
        }

        this.appearanceStream.N = xobj
        this.additional_objects_to_write.push({obj: xobj, func: ((ob: any) => ob.writeXObject())})
    }

    public validate(enact : boolean = true) : ErrorList {
        let errorList : ErrorList = super.validate(false)

        if (this.type !== "/Highlight") {
            errorList.push(new InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`))
        }

        if (enact) {
            for(let error of errorList) {
                throw error
            }
        }

        return errorList
    }
}

export class UnderlineAnnotationObj extends TextMarkupAnnotationObj {

    constructor() {
        super()
        this.type = "/Underline"
        this.type_encoded = [47, 85, 110, 100, 101, 114, 108, 105, 110, 101] // = '/Underline'
    }

    public validate(enact : boolean = true) : ErrorList {
        let errorList : ErrorList = super.validate(false)

        if (this.type !== "/Underline") {
            errorList.push(new InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`))
        }

        if (enact) {
            for(let error of errorList) {
                throw error
            }
        }

        return errorList
    }
}

export class SquigglyAnnotationObj extends TextMarkupAnnotationObj {

    constructor() {
        super()
        this.type = "/Squiggly"
        this.type_encoded = [47, 83, 113, 117, 105, 103, 103, 108, 121] // = '/Squiggly'
    }

    public validate(enact : boolean = true) : ErrorList {
        let errorList : ErrorList = super.validate(false)

        if (this.type !== "/Squiggly") {
            errorList.push(new InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`))
        }

        if (enact) {
            for(let error of errorList) {
                throw error
            }
        }

        return errorList
    }
}

export class StrikeOutAnnotationObj extends TextMarkupAnnotationObj {

    constructor() {
        super()
        this.type = "/StrikeOut"
        this.type_encoded = [47, 83, 116, 114, 105, 107, 101, 79, 117, 116] // = '/StrikeOut'
    }

    public validate(enact : boolean = true) : ErrorList {
        let errorList : ErrorList = super.validate(false)

        if (this.type !== "/StrikeOut") {
            errorList.push(new InvalidAnnotationTypeError(`Invalid annotation type ${this.type}`))
        }

        if (enact) {
            for(let error of errorList) {
                throw error
            }
        }

        return errorList
    }
}
