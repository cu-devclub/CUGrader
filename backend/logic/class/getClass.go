package class

import "cugrader/repository/class"

func GetClassInformation(ClassId int) (class.ClassObjectModel, error) {
	return class.GetClassById(ClassId)
}
